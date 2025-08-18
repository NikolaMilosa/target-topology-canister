use std::collections::BTreeMap;

use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

use crate::model::node::Node;

#[derive(CandidType, Serialize, Deserialize, Default, Clone)]
pub struct NakamotoCoefficient {
    attribute: String,
    value: u8,
}

#[derive(CandidType, Serialize, Deserialize, Default, Clone)]
pub struct NakamotoReport {
    before: Vec<NakamotoCoefficient>,
    after: Vec<NakamotoCoefficient>,
}

pub(super) fn calculate_nakamoto_report(
    current_nodes: Vec<Node>,
    nodes_to_add: Vec<Node>,
    nodes_to_remove: Vec<Principal>,
) -> NakamotoReport {
    let nodes_if_adopted = current_nodes
        .iter()
        .filter(|n| !nodes_to_remove.contains(&n.node_id))
        .chain(nodes_to_add.iter())
        .cloned()
        .collect();

    NakamotoReport {
        before: calculate_nakamoto_from_nodes(current_nodes),
        after: calculate_nakamoto_from_nodes(nodes_if_adopted),
    }
}

pub(super) fn calculate_nakamoto_from_nodes(nodes: Vec<Node>) -> Vec<NakamotoCoefficient> {
    #[allow(clippy::type_complexity)]
    let attributes: Vec<(&str, Box<dyn Fn(&Node) -> String>)> = vec![
        (
            "Node provider",
            Box::new(|node: &Node| node.node_provider_id.to_string()),
        ),
        (
            "Data center",
            Box::new(|node: &Node| node.dc_id.to_string()),
        ),
        (
            "Data center owner",
            Box::new(|node: &Node| node.dc_owner.to_string()),
        ),
        ("Country", Box::new(|node: &Node| node.country.to_string())),
    ];

    attributes
        .iter()
        .map(|(name, selector)| {
            let values = nodes.iter().map(selector).collect();
            (name, calculate_nakamoto_for_attribute(values))
        })
        .map(|(name, score)| NakamotoCoefficient {
            attribute: name.to_string(),
            value: score,
        })
        .collect()
}

fn calculate_nakamoto_for_attribute(occurences: Vec<String>) -> u8 {
    let mut counts = BTreeMap::new();
    let total_nodes = occurences.len();
    for entry in occurences {
        *counts.entry(entry).or_insert(0) += 1;
    }

    let mut values: Vec<usize> = counts.values().cloned().collect();
    values.sort_by(|a, b| b.cmp(a));

    let max_malicious = total_nodes / 3;

    let mut sum_actors = 0;
    let mut sum_nodes = 0;

    for actor_nodes in values {
        sum_actors += 1;
        sum_nodes += actor_nodes;

        if sum_nodes > max_malicious {
            break;
        }
    }

    sum_actors
}
