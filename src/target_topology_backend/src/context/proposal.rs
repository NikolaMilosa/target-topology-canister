use candid::Principal;

use crate::model::{node::Node, proposal::Proposal, topology::TargetTopology};

#[derive(Default)]
pub struct ProposalValidator {
    pub topology: TargetTopology,
    pub nodes: Vec<Node>,
}

// TODO: add tests for the validator.
impl ProposalValidator {
    pub fn with_topology(self, topology: TargetTopology) -> Self {
        Self { topology, ..self }
    }

    pub fn with_nodes(self, nodes: Vec<Node>) -> Self {
        Self { nodes, ..self }
    }

    pub fn validate_draft_proposal(self, proposal: &Proposal) -> Vec<String> {
        let mut warnings = vec![];

        let crate::model::proposal::ProposalPayload::ChangeSubnetMembership(payload) =
            &proposal.payload;

        // Ensure that the subnet being mentioned actually exists.
        self.ensure_subnet_exists(&payload.subnet_id)
            .unwrap_or_else(|e| warnings.push(e.to_string()));

        // Ensure that the nodes being added exist.
        warnings.extend(self.validate_added_nodes(&payload.node_ids_to_add));

        // Ensure that the nodes being removed are in the subnet
        // currently.
        warnings
            .extend(self.validate_removed_nodes(&payload.node_ids_to_remove, &payload.subnet_id));

        // Ensure that we don't propose to remove more than a third
        // of the nodes.
        self.ensure_no_consensus_breaking(payload.node_ids_to_add.len(), &payload.subnet_id)
            .unwrap_or_else(|e| warnings.push(e.to_string()));

        warnings
    }

    fn ensure_subnet_exists(&self, subnet_id: &Principal) -> anyhow::Result<()> {
        if !self.topology.entries.contains_key(&subnet_id.to_text()) {
            anyhow::bail!("Subnet {subnet_id} is not present in the current active topology")
        }

        Ok(())
    }

    fn validate_added_nodes(&self, to_be_added: &[Principal]) -> Vec<String> {
        let mut warnings = vec![];

        for new_node in to_be_added {
            let node = match self.nodes.iter().find(|n| n.node_id == *new_node) {
                Some(n) => n,
                None => {
                    warnings.push(format!("Node {new_node} is not found in the registry"));
                    continue;
                }
            };

            if node.is_api_bn {
                warnings.push(format!("Node {new_node} is an api boundary node"));
            }

            if node.subnet_id.is_some() {
                warnings.push(format!("Node {new_node} is not unassigned"));
            }
        }

        warnings
    }

    fn validate_removed_nodes(
        &self,
        to_be_removed: &[Principal],
        subnet_id: &Principal,
    ) -> Vec<String> {
        let mut warnings = vec![];

        for old_node in to_be_removed {
            let node = match self.nodes.iter().find(|n| n.node_id == *old_node) {
                Some(n) => n,
                None => {
                    warnings.push(format!("Node {old_node} is not found in the registry"));
                    continue;
                }
            };

            if node.subnet_id.is_none() || node.subnet_id.is_some_and(|s| s != *subnet_id) {
                warnings.push(format!(
                    "Node {old_node} is not a member of the subnet {subnet_id}"
                ));
            }
        }

        warnings
    }

    fn ensure_no_consensus_breaking(
        &self,
        changes: usize,
        subnet_id: &Principal,
    ) -> anyhow::Result<()> {
        let subnet_size: usize = self
            .nodes
            .iter()
            .map(|n| {
                if n.subnet_id.is_some_and(|s| s == *subnet_id) {
                    1
                } else {
                    0
                }
            })
            .sum();

        let maximum_swaps_allowed = subnet_size / 3;
        if maximum_swaps_allowed < changes {
            anyhow::bail!("Subnet {subnet_id} can withstand {maximum_swaps_allowed} swaps at any given time. This proposals is proposing {changes} swaps.")
        }

        Ok(())
    }
}
