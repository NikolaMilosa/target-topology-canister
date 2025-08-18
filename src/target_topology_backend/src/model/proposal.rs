use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct Proposal {
    pub id: String,
    pub title: String,
    pub timestamp_seconds: u64,
    pub payload: ProposalPayload,
    pub summary: String,
    pub link: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub enum ProposalPayload {
    ChangeSubnetMembership(ChangeSubnetMembership),
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct ChangeSubnetMembership {
    pub subnet_id: Principal,
    pub node_ids_to_add: Vec<Principal>,
    pub node_ids_to_remove: Vec<Principal>,
}
