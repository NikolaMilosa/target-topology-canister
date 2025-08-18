// react-bootstrap
import { Row, Col, Card, Table } from "react-bootstrap";

// project imports
import { target_topology_backend } from "declarations/target_topology_backend";
import { useEffect, useState } from "react";

import Chip from "@mui/material/Chip";

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
  const [targetTopologyConstraintsHold, setTargetTopologyConstraintsHold] =
    useState(false);

  const [attributeBreakdown, setAttributeBreakdown] = useState([]);

  useEffect(() => {
    target_topology_backend
      .get_nodes_for_subnet(Principal.fromText(subnet_id))
      .then((nodes) => {
        if (nodes.length == 0) {
          return;
        }

        const nodesMapped = nodes[0].map((node) => {
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

        setNodes(nodesMapped);

        const attributes = [
          ["Node provider", (node) => node.node_provider_id.split("-")[0]],
          ["Data center", (node) => node.dc_id],
          ["Country", (node) => node.country],
          ["Data center owner", (node) => node.dc_owner],
        ];

        setAttributeBreakdown(
          attributes.map(([attrName, selector]) => {
            const occurrences = nodesMapped
              .map(selector)
              .reduce((map, item) => {
                map.set(item, (map.get(item) || 0) + 1);
                return map;
              }, new Map());
            return {
              attrName: attrName,
              occurrences: occurrences,
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
        setTargetTopologyConstraintsHold(
          topologyReport[0].every((x) => x.violations.length == 0),
        );
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
          <Card>
            <Card.Header>
              <Card.Title as="h3">
                Target topology constraints
                <Chip
                  label={
                    targetTopologyConstraintsHold ? "Enforced" : "Not enforced"
                  }
                  size="small"
                  color={targetTopologyConstraintsHold ? "success" : "error"}
                  sx={{ mr: 1, ml: 1 }}
                />
              </Card.Title>
              <span>
                Target topology constraints ensure that a subnet is
                well-distributed across different entities to maintain
                decentralization. Each subnet has limits for countries, data
                centers, data center owners, and node providers. If any of these
                attributes exceed their respective limit, the subnet does not
                comply with the target topology constraints. Proper adherence
                helps prevent centralization and increases network resilience.
              </span>
            </Card.Header>
            <Card.Body>
              <Row>
                <TargetTopologyConstraints topologyReport={topologyReport} />
              </Row>
            </Card.Body>
          </Card>
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
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h3">Attribute breakdown</Card.Title>
              <span>Attribute wise breakdown of a subnet.</span>
            </Card.Header>
            <Card.Body>
              <Row>
                {attributeBreakdown.map((attr, ind) => (
                  <Col sm={6} md={3} key={ind}>
                    <Card>
                      <Card.Header>
                        <Card.Title as="h5">
                          Attribute: {attr.attrName}
                        </Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <Table>
                          <thead>
                            <tr>
                              <th>Value</th>
                              <th>Utilization</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from(attr.occurrences.entries()).map(
                              ([key, value]) => (
                                <tr key={key}>
                                  <td>
                                    <code>{key}</code>
                                  </td>
                                  <td>{value}</td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Row>
  );
}
