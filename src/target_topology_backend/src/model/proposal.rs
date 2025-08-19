use std::collections::BTreeSet;

use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Proposal {
    pub id: String,
    pub title: String,
    pub timestamp_seconds: u64,
    pub payload: ProposalPayload,
    pub summary: String,
    pub link: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ProposalPayload {
    ChangeSubnetMembership(ChangeSubnetMembership),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ChangeSubnetMembership {
    pub subnet_id: Principal,
    pub node_ids_to_add: Vec<Principal>,
    pub node_ids_to_remove: Vec<Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct ProposalWithWarnings {
    pub proposal: Proposal,
    pub warnings: Vec<String>,
}

impl Proposal {
    pub fn validate_draft(&self) -> anyhow::Result<()> {
        if self.id.parse::<u64>().is_ok() {
            return Err(anyhow::anyhow!("Id must not be a u64 because that is reserved for open proposals from the governance"));
        }

        if self.title.is_empty() {
            return Err(anyhow::anyhow!(
                "Title must be specified for a draft proposal"
            ));
        }

        self.payload.validate_draft()
    }
}

impl ProposalPayload {
    fn validate_draft(&self) -> anyhow::Result<()> {
        match &self {
            ProposalPayload::ChangeSubnetMembership(p) => {
                if p.node_ids_to_add.is_empty() || p.node_ids_to_remove.is_empty() {
                    return Err(anyhow::anyhow!("Proposal payload is invalid. `node_ids_to_add` and `node_ids_to_remove` must not be empty"));
                }

                if p.node_ids_to_add.len() != p.node_ids_to_remove.len() {
                    return Err(anyhow::anyhow!("Proposal payload is invalid. The number of nodes being added and the number of nodes being removed must be equal"));
                }

                let number_of_changes = p.node_ids_to_add.len();

                let mentioned_nodes: BTreeSet<_> = p
                    .node_ids_to_add
                    .iter()
                    .chain(p.node_ids_to_remove.iter())
                    .collect();

                if number_of_changes * 2 != mentioned_nodes.len() {
                    return Err(anyhow::anyhow!("Proposal payload is invalid. Nodes can't be removed and added at the same time"));
                }
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use candid::Principal;

    use super::Proposal;

    fn node(n: u64) -> Principal {
        let mut bytes = n.to_le_bytes().to_vec();
        bytes.push(0xfd); // internal marker for node test ids
        Principal::from_slice(&bytes[..])
    }

    fn proposal(
        id: &str,
        title: &str,
        nodes_to_add: &[Principal],
        nodes_to_remove: &[Principal],
    ) -> Proposal {
        Proposal {
            id: id.to_string(),
            title: title.to_string(),
            timestamp_seconds: 0,
            payload: super::ProposalPayload::ChangeSubnetMembership(
                super::ChangeSubnetMembership {
                    subnet_id: Principal::anonymous(),
                    node_ids_to_add: nodes_to_add.to_vec(),
                    node_ids_to_remove: nodes_to_remove.to_vec(),
                },
            ),
            summary: "TODO".to_string(),
            link: "".to_string(),
        }
    }

    #[test]
    fn proposal_validation_tests() {
        let payloads = [
            proposal(
                "123",
                "Invalid because of id being a number",
                &[node(1)],
                &[node(2)],
            ),
            // Invalid because of an empty title
            proposal("draft-123", "", &[node(1)], &[node(2)]),
            proposal(
                "draft-123",
                "Invalid because no added nodes",
                &[],
                &[node(2)],
            ),
            proposal(
                "draft-123",
                "Invalid because no removed nodes",
                &[node(1)],
                &[],
            ),
            proposal(
                "draft-123",
                "Invalid because no added and no removed nodes",
                &[],
                &[],
            ),
            proposal(
                "draft-123",
                "Invalid because not equal lengths of added and removed",
                &[node(1)],
                &[node(2), node(3)],
            ),
            proposal(
                "draft-123",
                "Invalid because repeated nodes",
                &[node(1)],
                &[node(1)],
            ),
            proposal(
                "draft-123",
                "Invalid because repeated nodes",
                &[node(1), node(2)],
                &[node(3), node(2)],
            ),
        ];

        for proposal in payloads {
            proposal
                .validate_draft()
                .err()
                .unwrap_or_else(|| panic!("Expected payload {:?} to fail.", proposal));
        }
    }
}
