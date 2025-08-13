use std::collections::BTreeMap;

use candid::CandidType;
use serde::{Deserialize, Serialize};

use crate::model::node::Node;

#[derive(CandidType, Serialize, Deserialize, Default, Clone)]
pub struct NakamotoCoefficient {
    attribute: String,
    value: u8,
}

pub(super) fn calculate_nakamoto_from_nodes(nodes: Vec<Node>) -> Vec<NakamotoCoefficient> {
    let attributes: Vec<(&str, Box<dyn Fn(&Node) -> String>)> = vec![
        (
            "Node provider",
            Box::new(|node: &Node| node.node_provider_id.to_string()),
        ),
        (
            "Data center",
            Box::new(|node: &Node| node.dc_id.to_string()),
        ),
    ];

    attributes
        .iter()
        .map(|(name, selector)| {
            let values = nodes.iter().map(|node| selector(node)).collect();
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
