use std::cell::RefCell;

use candid::Principal;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    BTreeMap, DefaultMemoryImpl,
};

use crate::{
    context::topology::calculate_topology_limit_report_with_nodes,
    model::{
        node::Node,
        proposal::{ChangeSubnetMembership, Proposal, ProposalWithWarnings},
        topology::TargetTopology,
    },
};

use self::{
    nakamoto::{
        calculate_nakamoto_from_nodes, calculate_nakamoto_report, NakamotoCoefficient,
        NakamotoReport,
    },
    proposal::ProposalValidator,
    topology::{calculate_topology_limit_report, TopologyLimitReport},
};

pub mod nakamoto;
mod proposal;
pub mod topology;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    static CONTEXT: RefCell<Context> = RefCell::new(Context::new(
        BTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        ),
        BTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    ))
}

pub fn with_context<F, R>(f: F) -> R
where
    F: FnOnce(&Context) -> R,
{
    CONTEXT.with_borrow(f)
}
pub fn with_context_mut<F, R>(f: F) -> R
where
    F: FnOnce(&mut Context) -> R,
{
    CONTEXT.with_borrow_mut(f)
}

pub struct Context {
    nodes: BTreeMap<Principal, Node, Memory>,
    topology_manager: BTreeMap<String, TargetTopology, Memory>,
    proposals: std::collections::BTreeMap<u64, Proposal>,
    draft_proposals: std::collections::BTreeMap<String, Proposal>,
}

impl Context {
    pub fn new(
        nodes: BTreeMap<Principal, Node, Memory>,
        topology_manager: BTreeMap<String, TargetTopology, Memory>,
    ) -> Self {
        Self {
            nodes,
            topology_manager,
            proposals: std::collections::BTreeMap::new(),
            draft_proposals: std::collections::BTreeMap::new(),
        }
    }

    pub fn nodes(&self) -> Vec<Node> {
        self.nodes.iter().map(|e| e.value().clone()).collect()
    }

    // TODO: use only for testing, in prod, should pull from registry
    pub fn add_node(&mut self, node: Node) -> anyhow::Result<()> {
        self.nodes.insert(node.node_id, node);

        Ok(())
    }

    // TODO: use only for testing, in prod, should pull from registry
    pub fn add_nodes(&mut self, nodes: Vec<Node>) -> anyhow::Result<()> {
        for node in nodes {
            self.add_node(node)?;
        }

        Ok(())
    }

    pub fn get_node(&self, node_id: Principal) -> Option<Node> {
        self.nodes.get(&node_id)
    }

    pub fn get_subnet(&self, subnet_id: Principal) -> Option<Vec<Node>> {
        let nodes_in_subnet: Vec<_> = self
            .nodes
            .iter()
            .map(|v| v.value())
            .filter(|n| n.subnet_id.is_some_and(|id| id.eq(&subnet_id)))
            .collect();

        if nodes_in_subnet.is_empty() {
            return None;
        }

        Some(nodes_in_subnet)
    }

    pub fn calculate_nakamoto(&self, subnet_id: Principal) -> Option<Vec<NakamotoCoefficient>> {
        self.get_subnet(subnet_id)
            .map(calculate_nakamoto_from_nodes)
    }

    pub fn calculate_nakamoto_changes_for_proposal(
        &self,
        proposal_id: String,
    ) -> Option<NakamotoReport> {
        let proposal = match proposal_id.parse::<u64>() {
            Ok(id) => self.proposals.get(&id)?,
            _ => self.draft_proposals.get(&proposal_id)?,
        };

        let crate::model::proposal::ProposalPayload::ChangeSubnetMembership(
            ChangeSubnetMembership {
                subnet_id,
                node_ids_to_add,
                node_ids_to_remove,
            },
        ) = &proposal.payload;

        let current_nodes = self.get_subnet(*subnet_id)?;

        let nodes_to_add: Vec<_> = node_ids_to_add
            .iter()
            .map(|p| self.get_node(*p).unwrap())
            .collect();

        Some(calculate_nakamoto_report(
            current_nodes,
            nodes_to_add,
            node_ids_to_remove.clone(),
        ))
    }

    pub fn calculate_topology_changes_for_proposal(
        &self,
        proposal_id: String,
    ) -> Option<Vec<Vec<TopologyLimitReport>>> {
        let proposal = match proposal_id.parse::<u64>() {
            Ok(id) => self.proposals.get(&id)?,
            _ => self.draft_proposals.get(&proposal_id)?,
        };

        let topology = self.get_active_topology()?;
        let crate::model::proposal::ProposalPayload::ChangeSubnetMembership(proposal) =
            &proposal.payload;

        let current_nodes = self.get_subnet(proposal.subnet_id)?;

        let nodes_to_add: Vec<_> = proposal
            .node_ids_to_add
            .iter()
            .map(|p| self.get_node(*p).unwrap())
            .collect();

        Some(calculate_topology_limit_report_with_nodes(
            current_nodes,
            topology,
            nodes_to_add,
            proposal.node_ids_to_remove.clone(),
        ))
    }

    pub fn get_active_topology(&self) -> Option<TargetTopology> {
        self.topology_manager.last_key_value().map(|(_, val)| val)
    }

    pub fn add_topology(&mut self, target_topology: TargetTopology) -> anyhow::Result<()> {
        self.topology_manager
            .insert(target_topology.proposal.clone(), target_topology);

        Ok(())
    }

    pub fn check_topology_constraints(
        &self,
        subnet_id: Principal,
    ) -> Option<Vec<TopologyLimitReport>> {
        let nodes = self.get_subnet(subnet_id);
        let topology = self.get_active_topology();

        match (nodes, topology) {
            (Some(nodes), Some(topology)) => {
                Some(calculate_topology_limit_report(nodes, &topology))
            }
            _ => None,
        }
    }

    pub fn add_proposal(&mut self, proposal: Proposal) -> anyhow::Result<()> {
        let key = proposal.id.parse()?;
        self.proposals.insert(key, proposal);
        Ok(())
    }

    pub fn add_proposals(&mut self, proposals: Vec<Proposal>) -> anyhow::Result<()> {
        for proposal in proposals {
            self.add_proposal(proposal)?;
        }
        Ok(())
    }

    pub fn get_proposals(&self) -> Vec<Proposal> {
        self.proposals.values().cloned().collect()
    }

    pub fn get_draft_proposals(&self) -> Vec<Proposal> {
        self.draft_proposals.values().cloned().collect()
    }

    pub fn get_draft_proposal_with_warnings(
        &self,
        proposal: String,
    ) -> Option<ProposalWithWarnings> {
        let proposal = self.draft_proposals.get(&proposal)?;

        let topology = self.get_active_topology()?;

        let nodes: Vec<_> = self.nodes.values().collect();

        let warnings = ProposalValidator::default()
            .with_topology(topology)
            .with_nodes(nodes)
            .validate_draft_proposal(proposal);

        Some(ProposalWithWarnings {
            proposal: proposal.clone(),
            warnings,
        })
    }

    pub fn add_draft_proposal(&mut self, proposal: Proposal) -> anyhow::Result<()> {
        // We do just basic validations here and refuse proposals
        // that are not formatted well. Other issues will be rendered
        // as warnings.
        proposal.validate_draft()?;

        self.draft_proposals.insert(proposal.id.clone(), proposal);
        Ok(())
    }
}
