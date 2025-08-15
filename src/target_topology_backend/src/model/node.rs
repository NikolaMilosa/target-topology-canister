use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::{storable::Bound, Storable};
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
    pub country: String,
    pub dc_owner: String,
}

impl Storable for Node {
    fn to_bytes(&self) -> std::borrow::Cow<'_, [u8]> {
        std::borrow::Cow::Owned(Encode!(self).unwrap())
    }

    fn into_bytes(self) -> Vec<u8> {
        Encode!(&self).unwrap()
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}
