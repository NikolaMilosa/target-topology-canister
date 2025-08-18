// react-bootstrap
import { Row, Col, Card } from "react-bootstrap";

// project imports
import { target_topology_backend } from "declarations/target_topology_backend";
import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { Principal } from "@dfinity/principal";

import SubnetDetailWithNodes from "../../../components/SubnetBasicDetails/index.jsx";
import TargetTopologyConstraints from "../../../components/TargetTopologyConstraints/index.jsx";
import NakamotoBreakdown from "../../../components/NakamotoBreakdown";

export default function SubnetDetail() {
  const { subnet_id } = useParams();
  const [nodes, setNodes] = useState([]);
  const [subnetTopology, setSubnetTopology] = useState({});
  const [nakamoto, setNakamoto] = useState([]);
  const [topologyReport, setTopologyReport] = useState([]);

  useEffect(() => {
    target_topology_backend
      .get_nodes_for_subnet(Principal.fromText(subnet_id))
      .then((nodes) => {
        if (nodes.length == 0) {
          return;
        }

        setNodes(
          nodes[0].map((node) => {
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
          }),
        );
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

    target_topology_backend
      .get_nakamoto_for_subnet(Principal.fromText(subnet_id))
      .then((nakamoto) => {
        if (nakamoto.length == 0) {
          return;
        }

        setNakamoto(
          nakamoto[0].map((nakamoto) => {
            nakamoto["variant"] = "secondary";
            return nakamoto;
          }),
        );
      });

    target_topology_backend
      .get_topology_report(Principal.fromText(subnet_id))
      .then((topologyReport) => {
        if (topologyReport.length == 0) {
          return;
        }

        setTopologyReport(topologyReport[0]);
      });
  }, [subnet_id]);

  return (
    <Row>
      <SubnetDetailWithNodes
        subnet_id={subnet_id}
        nodes={nodes}
        subnetTopology={subnetTopology}
      />
      <Row>
        <Col sm={12} md={6}>
          <TargetTopologyConstraints topologyReport={topologyReport} />
        </Col>
        <Col sm={12} md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h3">Nakamoto coefficients breakdown</Card.Title>
              <span>
                Shows how many independent entities would need to collude to
                compromise decentralization. A higher coefficient means stronger
                decentralization and resilience against control. To read more
                visit{" "}
                <a href="https://www.ledger.com/academy/glossary/nakamoto-coefficient">
                  Ledger academy
                </a>
                .{" "}
              </span>
            </Card.Header>
            <Card.Body>
              <NakamotoBreakdown nakamoto={nakamoto} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Row>
  );
}
