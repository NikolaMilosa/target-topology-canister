use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Clone, Serialize, Deserialize)]
pub struct Node {
    pub node_id: Principal,
    pub subnet_id: Option<Principal>,
    pub node_provider_id: Principal,
    pub node_operator_id: Principal,
    pub dc_id: String,
    pub ip: String,
    pub hostos_version: String,
    pub guestos_version: String,
    pub is_api_bn: bool,
    pub node_reward_type: String,
}
