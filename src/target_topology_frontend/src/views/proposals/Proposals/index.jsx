import { Card, Col, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { target_topology_backend } from "declarations/target_topology_backend";
import { useState, useEffect } from "react";
import SubnetDetailWithNodes, {
  mapNodes,
} from "../../../components/SubnetBasicDetails";
import NakamotoBreakdown from "../../../components/NakamotoBreakdown";
import TargetTopologyConstraints from "../../../components/TargetTopologyConstraints";

import Chip from "@mui/material/Chip";
import { Principal } from "@dfinity/principal";
import AttributeBreakdown from "../../../components/AttributeBreakdown";
import NodesTable from "../../../components/NodesTable";

export default function Proposals() {
  const { proposal_id } = useParams();
  const [proposal, setProposal] = useState({});
  const [subnetId, setSubnetId] = useState("");
  const [nakamotoBefore, setNakamotoBefore] = useState([]);
  const [nakamotoAfter, setNakamotoAfter] = useState([]);
  const [topologyReportBefore, setTopologyReportBefore] = useState([]);

  const [
    targetTopologyConstraintsHoldBefore,
    setTargetTopologyConstraintsHoldBefore,
  ] = useState(false);
  const [topologyReportAfter, setTopologyReportAfter] = useState([]);

  const [
    targetTopologyConstraintsHoldAfter,
    setTargetTopologyConstraintsHoldAfter,
  ] = useState(false);

  const [attributeBreakdown, setAttributeBreakdown] = useState([]);

  const [toBeAddedNodes, setToBeAddedNodes] = useState([]);
  const [toBeRemovedNodes, setToBeRemovedNodes] = useState([]);

  useEffect(() => {
    target_topology_backend.get_proposals().then((proposals) => {
      const prop = proposals.find((proposal) => proposal.id == proposal_id);
      if (!prop) {
        return;
      }

      const payload = prop.payload.ChangeSubnetMembership;
      const subnet = String(payload.subnet_id);
      setSubnetId(subnet);
      setProposal({
        subnet_id: subnet,
        node_ids_add: payload.node_ids_to_add.map((p) => String(p)),
        node_ids_remove: payload.node_ids_to_remove.map((p) => String(p)),
      });
    });

    target_topology_backend
      .nakamoto_report_for_proposal(proposal_id)
      .then((maybeReport) => {
        if (maybeReport.length == 0) {
          return;
        }

        const report = maybeReport[0];
        setNakamotoBefore(
          report["before"].map((coef) => {
            coef["variant"] = "secondary";
            return coef;
          }),
        );

        const nakamotoAfter = [];
        for (let i in report["before"]) {
          let before = report["before"][i];
          let after = report["after"][i];

          if (before.value < after.value) {
            after["variant"] = "success";
          } else if (before.value == after.value) {
            after["variant"] = "secondary";
          } else {
            after["variant"] = "warning";
          }

          nakamotoAfter.push(after);
        }

        setNakamotoAfter(nakamotoAfter);
      });

    target_topology_backend
      .topology_report_for_proposal(proposal_id)
      .then((maybeReport) => {
        if (maybeReport.length == 0) return;

        const before = maybeReport[0][0];

        setTopologyReportBefore(before);
        setTargetTopologyConstraintsHoldBefore(
          before.every((x) => x.violations.length == 0),
        );

        const after = maybeReport[0][1];
        setTopologyReportAfter(after);
        setTargetTopologyConstraintsHoldAfter(
          after.every((x) => x.violations.length == 0),
        );
      });
  }, [proposal_id]);

  useEffect(() => {
    if (subnetId.length == 0 || proposal == null) return;

    async function gatherAttributeBreakdown() {
      const maybeNodes = await target_topology_backend.get_nodes_for_subnet(
        Principal.fromText(subnetId),
      );

      if (maybeNodes.length == 0) return;

      const nodes = maybeNodes[0];

      const addedNodes = [];
      for (let node of proposal.node_ids_add) {
        const maybeNode = await target_topology_backend.get_node(
          Principal.fromText(node),
        );

        if (maybeNode.length == 0) conitnue;

        addedNodes.push(maybeNode[0]);
      }
      setToBeAddedNodes(mapNodes(addedNodes));
      setToBeRemovedNodes(
        mapNodes(
          nodes.filter((node) =>
            proposal.node_ids_remove.some((p) => p == String(node.node_id)),
          ),
        ),
      );

      const attributes = [
        [
          "Node provider",
          (node) => String(node.node_provider_id),
          (id) => `/network/providers/${id}`,
          (id) => id.split("-")[0],
        ],
        [
          "Data center",
          (node) => node.dc_id,
          (id) => `/network/centers/${id}`,
          null,
        ],
        ["Country", (node) => node.country, null, null],
        ["Data center owner", (node) => node.dc_owner, null, null],
      ];

      setAttributeBreakdown(
        attributes.map(([attrName, selector, urlMaker, transformer]) => {
          const occurrencesBefore = nodes.map(selector).reduce((map, item) => {
            map.set(item, (map.get(item) || 0) + 1);
            return map;
          }, new Map());

          const after = nodes.filter((node) =>
            proposal.node_ids_remove.every(
              (pr) => String(pr) != String(node.node_id),
            ),
          );
          for (let newNode of addedNodes) {
            after.push(newNode);
          }

          const occurrencesAfter = after.map(selector).reduce((map, item) => {
            map.set(item, (map.get(item) || 0) + 1);
            return map;
          }, new Map());

          return {
            attrName: attrName,
            transformer: transformer,
            urlMaker: urlMaker,
            occurrencesBefore: occurrencesBefore,
            occurrencesAfter: occurrencesAfter,
          };
        }),
      );
    }

    gatherAttributeBreakdown();
  }, [subnetId, proposal]);

  return (
    <Row>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h1">
                Proposal{" "}
                <a
                  href={`https://dashboard.internetcomputer.org/proposal/${proposal_id}`}
                >
                  {proposal_id}
                </a>{" "}
                [Subnet <code>{subnetId.split("-")[0]}</code>]
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <h3>Proposal payload</h3>
              <pre className="bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(proposal, null, 2)}</code>
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6} sm={12}>
          <NodesTable
            title="Nodes added"
            subtitle="These nodes are proposed to be added to the subnet."
            nodes={toBeAddedNodes}
          />
        </Col>
        <Col md={6} sm={12}>
          <NodesTable
            title="Nodes removed"
            subtitle="These nodes are proposed to be removed from the subnet."
            nodes={toBeRemovedNodes}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h3">
                Target topology constraints enforcement
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
                <Col md={6} sm={12}>
                  <Card>
                    <Card.Header>
                      <Card.Title as="h5">
                        Current target topology constraints enforcement
                      </Card.Title>
                      <span>
                        The current status of subnet target topology constraints
                      </span>
                      <br />
                      <Chip
                        label={
                          targetTopologyConstraintsHoldBefore
                            ? "Enforced"
                            : "Not enforced"
                        }
                        size="small"
                        color={
                          targetTopologyConstraintsHoldBefore
                            ? "success"
                            : "error"
                        }
                        sx={{ mr: 1, mt: 1 }}
                      />
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <TargetTopologyConstraints
                          topologyReport={topologyReportBefore}
                        />
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} sm={12}>
                  <Card>
                    <Card.Header>
                      <Card.Title as="h5">If proposal was adopted</Card.Title>
                      <span>
                        This the new status of the target topology constraints
                        if the proposal is adopted.
                      </span>
                      <br />
                      <Chip
                        label={
                          targetTopologyConstraintsHoldAfter
                            ? "Enforced"
                            : "Not enforced"
                        }
                        size="small"
                        color={
                          targetTopologyConstraintsHoldAfter
                            ? "success"
                            : "error"
                        }
                        sx={{ mr: 1, mt: 1 }}
                      />
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <TargetTopologyConstraints
                          topologyReport={topologyReportAfter}
                        />
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h3">Nakamoto coefficients changes</Card.Title>
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
              <Row>
                <Col md={6} sm={12}>
                  <Card>
                    <Card.Header>
                      <Card.Title as="h5">
                        Current nakamoto coefficients
                      </Card.Title>
                      <span>Represents the current nakamoto coefficients.</span>
                    </Card.Header>
                    <Card.Body>
                      <NakamotoBreakdown nakamoto={nakamotoBefore} />
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} sm={12}>
                  <Card>
                    <Card.Header>
                      <Card.Title as="h5">If proposal was adopted</Card.Title>
                      <span>
                        This will be the new nakamoto coefficients if the
                        proposal is adopted.
                      </span>
                    </Card.Header>
                    <Card.Body>
                      <NakamotoBreakdown nakamoto={nakamotoAfter} />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
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
                <AttributeBreakdown attributeBreakdown={attributeBreakdown} />
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <SubnetDetailWithNodes subnet_id={subnetId} />
    </Row>
  );
}
