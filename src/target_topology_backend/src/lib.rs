use candid::Principal;
use context::{
    nakamoto::{NakamotoCoefficient, NakamotoReport},
    topology::TopologyLimitReport,
    with_context, with_context_mut,
};
use model::{node::Node, proposal::Proposal, topology::TargetTopology, TargetTopologyResult};

mod context;
mod model;

#[ic_cdk::query]
fn get_nodes() -> Vec<Node> {
    with_context(|ctx| ctx.nodes())
}

// TODO: remove this in production
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

#[ic_cdk::query]
fn get_nakamoto_for_subnet(subnet_id: Principal) -> Option<Vec<NakamotoCoefficient>> {
    with_context(|ctx| ctx.calculate_nakamoto(subnet_id))
}

#[ic_cdk::query]
fn get_active_topology() -> Option<TargetTopology> {
    with_context(|ctx| ctx.get_active_topology())
}

// TODO: ensure only some callers can call this
#[ic_cdk::update]
fn add_topology(topology: TargetTopology) -> TargetTopologyResult<()> {
    with_context_mut(|ctx| ctx.add_topology(topology).into())
}

#[ic_cdk::query]
fn get_topology_report(subnet_id: Principal) -> Option<Vec<TopologyLimitReport>> {
    with_context(|ctx| ctx.check_topology_constraints(subnet_id))
}

#[ic_cdk::query]
fn get_proposals() -> Vec<Proposal> {
    with_context(|ctx| ctx.get_proposals())
}

#[ic_cdk::update]
fn add_proposals(proposals: Vec<Proposal>) {
    with_context_mut(|ctx| ctx.add_proposals(proposals))
}

#[ic_cdk::query]
fn nakamoto_report_for_proposal(proposal: u64) -> Option<NakamotoReport> {
    with_context(|ctx| ctx.calculate_nakamoto_changes_for_proposal(proposal))
}

#[ic_cdk::query]
fn topology_report_for_proposal(proposal: u64) -> Option<Vec<Vec<TopologyLimitReport>>> {
    with_context(|ctx| ctx.calculate_topology_changes_for_proposal(proposal))
}

// Export the interface for the smart contract.
ic_cdk::export_candid!();
