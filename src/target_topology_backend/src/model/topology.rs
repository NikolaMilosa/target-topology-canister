use std::collections::BTreeMap;

use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};

use super::node::Node;

#[derive(CandidType, Serialize, Deserialize)]
pub struct TopologyEntry {
    pub subnet_type: String,
    pub subnet_id: Principal,
    pub subnet_size: u8,
    pub is_sev: bool,
    pub subnet_limit_node_provider: u8,
    pub subnet_limit_data_center: u8,
}

#[derive(CandidType, Serialize, Deserialize)]
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

#[derive(CandidType, Deserialize, Serialize)]
pub struct TopologyLimitViolation {
    pub found: u8,
    pub value: String,
}

#[derive(CandidType, Deserialize, Serialize)]
pub struct TopologyLimitReport {
    pub limit_name: String,
    pub limit_value: u8,

    pub violations: Vec<TopologyLimitViolation>,
}

pub fn calculate_topology_limit_report(
    nodes: Vec<Node>,
    topology: TargetTopology,
) -> Vec<TopologyLimitReport> {
    let attributes: Vec<(
        &str,
        Box<dyn Fn(&Node) -> String>,
        Box<dyn Fn(&TargetTopology, &str) -> Option<u8>>,
    )> = vec![
        (
            "Node provider",
            Box::new(|node: &Node| node.node_provider_id.to_string()),
            Box::new(|topology: &TargetTopology, subnet: &str| {
                topology
                    .entries
                    .get(subnet)
                    .map(|entry| entry.subnet_limit_node_provider)
            }),
        ),
        (
            "Data center",
            Box::new(|node: &Node| node.dc_id.to_string()),
            Box::new(|topology: &TargetTopology, subnet: &str| {
                topology
                    .entries
                    .get(subnet)
                    .map(|entry| entry.subnet_limit_data_center)
            }),
        ),
    ];

    if nodes.is_empty() {
        return vec![];
    }

    let first = nodes
        .first()
        .expect("All nodes should be in a single subnet");
    let subnet_id = first.subnet_id.unwrap().to_string();

    attributes
        .iter()
        .map(|(attr, selector, topology_selector)| {
            let attributes: Vec<_> = nodes.iter().map(|node| selector(node)).collect();
            let topology_value = topology_selector(&topology, &subnet_id).unwrap();

            TopologyLimitReport {
                limit_name: attr.to_string(),
                limit_value: topology_value,
                violations: calculate_topology_limit_violation(attributes, topology_value),
            }
        })
        .collect()
}

fn calculate_topology_limit_violation(
    attributes: Vec<String>,
    limit: u8,
) -> Vec<TopologyLimitViolation> {
    let mut counts = std::collections::BTreeMap::new();
    for attr in attributes {
        *counts.entry(attr).or_insert(0) += 1_u8;
    }

    counts
        .into_iter()
        .filter(|(_, v)| *v > limit)
        .map(|(key, val)| TopologyLimitViolation {
            found: val,
            value: key,
        })
        .collect()
}
