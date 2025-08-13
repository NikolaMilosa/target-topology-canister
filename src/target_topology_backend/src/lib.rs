use candid::Principal;
use context::{with_context, with_context_mut};
use model::{node::Node, TargetTopologyResult};

mod context;
mod model;

#[ic_cdk::query]
fn get_nodes() -> Vec<Node> {
    with_context(|ctx| ctx.nodes())
}

#[ic_cdk::update]
fn add_nodes(nodes: Vec<Node>) -> TargetTopologyResult<()> {
    with_context_mut(|ctx| ctx.add_nodes(nodes).into())
}

#[ic_cdk::query]
fn get_node(node_id: Principal) -> Option<Node> {
    with_context(|ctx| ctx.get_node(node_id))
}

#[ic_cdk::query]
fn get_nodes_for_subnet(subnet_id: Principal) -> Option<Vec<Node>> {
    with_context(|ctx| ctx.get_subnet(subnet_id))
}

// Export the interface for the smart contract.
ic_cdk::export_candid!();
