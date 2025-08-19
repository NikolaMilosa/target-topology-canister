use std::collections::BTreeMap;

use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize)]
pub struct TopologyEntry {
    pub subnet_type: String,
    pub subnet_id: Principal,
    pub subnet_size: u8,
    pub is_sev: bool,
    pub subnet_limit_node_provider: u8,
    pub subnet_limit_data_center: u8,
    pub subnet_limit_data_center_owner: u8,
    pub subnet_limit_country: u8,
}

#[derive(CandidType, Serialize, Deserialize, Default)]
pub struct TargetTopology {
    pub proposal: String,
    pub entries: BTreeMap<String, TopologyEntry>,
    pub timestamp_seconds: u64,
}

impl Storable for TargetTopology {
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
