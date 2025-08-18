use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

use crate::model::{node::Node, topology::TargetTopology};

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

pub fn calculate_topology_limit_report_with_nodes(
    current_nodes: Vec<Node>,
    topology: TargetTopology,
    nodes_to_add: Vec<Node>,
    nodes_to_remove: Vec<Principal>,
) -> Vec<Vec<TopologyLimitReport>> {
    let mut report = vec![];

    report.push(calculate_topology_limit_report(
        current_nodes.clone(),
        &topology,
    ));

    let nodes_after = current_nodes
        .into_iter()
        .filter(|node| !nodes_to_remove.contains(&node.node_id))
        .chain(nodes_to_add)
        .collect();

    report.push(calculate_topology_limit_report(nodes_after, &topology));

    report
}

pub fn calculate_topology_limit_report(
    nodes: Vec<Node>,
    topology: &TargetTopology,
) -> Vec<TopologyLimitReport> {
    #[allow(clippy::type_complexity)]
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
        (
            "Data center owner",
            Box::new(|node: &Node| node.dc_owner.to_string()),
            Box::new(|topology: &TargetTopology, subnet: &str| {
                topology
                    .entries
                    .get(subnet)
                    .map(|entry| entry.subnet_limit_data_center_owner)
            }),
        ),
        (
            "Country",
            Box::new(|node: &Node| node.country.to_string()),
            Box::new(|topology: &TargetTopology, subnet: &str| {
                topology
                    .entries
                    .get(subnet)
                    .map(|entry| entry.subnet_limit_country)
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
            let attributes: Vec<_> = nodes.iter().map(selector).collect();
            let topology_value = topology_selector(topology, &subnet_id).unwrap();

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
