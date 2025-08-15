use std::cell::RefCell;

use candid::Principal;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    BTreeMap, DefaultMemoryImpl,
};

use crate::model::{node::Node, topology::TargetTopology};

use self::{
    nakamoto::{calculate_nakamoto_from_nodes, NakamotoCoefficient},
    topology::{calculate_topology_limit_report, TopologyLimitReport},
};

pub mod nakamoto;
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
}

impl Context {
    pub fn new(
        nodes: BTreeMap<Principal, Node, Memory>,
        topology_manager: BTreeMap<String, TargetTopology, Memory>,
    ) -> Self {
        Self {
            nodes,
            topology_manager,
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
            .map(|nodes| calculate_nakamoto_from_nodes(nodes))
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
            (Some(nodes), Some(topology)) => Some(calculate_topology_limit_report(nodes, topology)),
            _ => None,
        }
    }
}
