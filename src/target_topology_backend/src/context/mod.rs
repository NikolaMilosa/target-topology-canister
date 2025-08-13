use std::{cell::RefCell, collections::BTreeMap};

use candid::Principal;

use crate::model::node::Node;

thread_local! {
    static CONTEXT: RefCell<Context> = RefCell::new(Context::new())
}

pub fn with_context<F, R>(f: F) -> R
where
    F: FnOnce(&Context) -> R,
{
    CONTEXT.with_borrow(f)
}
pub fn with_context_mut<F, R>(f: F) -> R
where
    F: FnOnce(&mut Context) -> R,
{
    CONTEXT.with_borrow_mut(f)
}

pub struct Context {
    nodes: BTreeMap<Principal, Node>,
}

impl Context {
    pub fn new() -> Self {
        Self {
            nodes: BTreeMap::new(),
        }
    }

    pub fn nodes(&self) -> Vec<Node> {
        self.nodes.values().cloned().collect()
    }

    // TODO: use only for testing, in prod, should pull from registry
    pub fn add_node(&mut self, node: Node) -> anyhow::Result<()> {
        if self.nodes.get(&node.node_id).is_some() {
            return Err(anyhow::anyhow!(
                "Node with id {} already exists",
                node.node_id
            ));
        }

        self.nodes.insert(node.node_id, node);

        Ok(())
    }

    // TODO: use only for testing, in prod, should pull from registry
    pub fn add_nodes(&mut self, nodes: Vec<Node>) -> anyhow::Result<()> {
        for node in nodes {
            self.add_node(node)?;
        }

        Ok(())
    }
}
