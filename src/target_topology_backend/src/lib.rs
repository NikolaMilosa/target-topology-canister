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

// Export the interface for the smart contract.
ic_cdk::export_candid!();
