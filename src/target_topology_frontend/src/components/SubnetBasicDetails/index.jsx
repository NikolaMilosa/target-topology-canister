import { Row, Col, Card } from "react-bootstrap";

import ProductCard from "../../components/Widgets/Statistic/ProductCard";

import { useEffect, useState } from "react";
import { target_topology_backend } from "declarations/target_topology_backend";
import { Principal } from "@dfinity/principal";

import Chip from "@mui/material/Chip";
import NodesTable from "../NodesTable";

import subnetForumMap from "../../config/subnet_forum_map";

export function mapNodes(nodes) {
  return nodes.map((node) => {
    return {
      node_id: String(node["node_id"]),
      dc_id: node["dc_id"],
      dc_owner: node["dc_owner"],
      hostos_version: node["hostos_version"],
      ip: node["ip"],
      node_operator_id: String(node["node_operator_id"]),
      node_provider_id: String(node["node_provider_id"]),
      country: node["country"],
    };
  });
}

export default function SubnetDetailWithNodes({ subnet_id }) {
  const subnet_short = subnet_id.split("-")[0];
  const [nodes, setNodes] = useState([]);
  const [subnetTopology, setSubnetTopology] = useState({});
  const [forumLink, setForumLink] = useState("");

  useEffect(() => {
    function fetchData() {
      {
        if (subnet_id.length == 0) {
          return;
        }
        target_topology_backend
          .get_nodes_for_subnet(Principal.fromText(subnet_id))
          .then((nodes) => {
            if (nodes.length == 0) {
              return;
            }

            setNodes(mapNodes(nodes[0]));
          });

        target_topology_backend.get_active_topology().then((topology) => {
          if (topology.length == 0) {
            return;
          }

          const currTopology = topology[0]["entries"].find(
            (entry) => String(entry["0"]) === subnet_id,
          )["1"];
          currTopology.proposal = topology[0]["proposal"];
          setSubnetTopology(currTopology);
        });

        const forumMap = subnetForumMap();
        if (forumMap.has(subnet_id)) {
          const forumMetadata = forumMap.get(subnet_id);
          setForumLink(
            `https://forum.dfinity.org/t/${forumMetadata["slug"]}/${forumMetadata["topic_id"]}`,
          );
        }
      }
    }

    fetchData();

    const interval = setInterval(() => {
      try {
        fetchData();
      } catch (err) {
        console.error("Failed to fetch subnet basic detail", subnet_id, err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [subnet_id]);

  return (
    <>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h1">
                Subnet <code className="d-none d-md-inline">{subnet_id}</code>{" "}
                <code className="d-md-none">{subnet_short}</code>
              </Card.Title>
            </Card.Header>
            <Card.Body>
              This panel has all the information about subnet{" "}
              <code className="d-none d-md-inline">{subnet_id}</code>
              <code className="d-md-none">{subnet_short}</code>.{" "}
              <br className="d-none d-md-inline" />
              For more information visit the{" "}
              <a
                href={`https://dashboard.internetcomputer.org/network/subnets/${subnet_id}`}
              >
                public dashboard
              </a>
              .<br className="d-none d-md-inline" />
              Join the discussion about the subnet on the{" "}
              <a href={forumLink}>public forum</a>.
            </Card.Body>
            <Card.Footer>
              Tags:
              <Chip
                label={subnetTopology.subnet_type}
                size="small"
                color="primary"
                sx={{ mr: 1, ml: 1 }}
              />
              {subnetTopology.is_sev && (
                <Chip label="SEV-SNP" size="small" color="primary" />
              )}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm={6} md={3}>
          <ProductCard
            params={{
              variant: "primary",
              title: "Country limit",
              primaryText: `${subnetTopology["subnet_limit_country"]}`,
              icon: "map",
            }}
          />
        </Col>
        <Col md={3} sm={6}>
          <ProductCard
            params={{
              variant: "primary",
              title: "Data center limit",
              primaryText: `${subnetTopology.subnet_limit_data_center}`,
              icon: "computer",
            }}
          />
        </Col>
        <Col sm={6} md={3}>
          <ProductCard
            params={{
              variant: "primary",
              title: "Data center owner limit",
              primaryText: `${subnetTopology.subnet_limit_data_center_owner}`,
              icon: "group",
            }}
          />
        </Col>
        <Col sm={6} md={3}>
          <ProductCard
            params={{
              variant: "primary",
              title: "Node provider limit",
              primaryText: `${subnetTopology.subnet_limit_node_provider}`,
              icon: "person",
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <NodesTable
            nodes={nodes}
            title="Nodes"
            subtitle="List of nodes that are a part of the subnet."
          />
        </Col>
      </Row>
    </>
  );
}
