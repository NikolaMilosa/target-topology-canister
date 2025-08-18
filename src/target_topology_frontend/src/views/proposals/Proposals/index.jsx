import { Card, Col, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { target_topology_backend } from "declarations/target_topology_backend";
import { useState, useEffect } from "react";
import SubnetDetailWithNodes from "../../../components/SubnetBasicDetails";
import NakamotoBreakdown from "../../../components/NakamotoBreakdown";
import { Principal } from "@dfinity/principal";

export default function Proposals() {
  const { proposal_id } = useParams();
  const [proposal, setProposal] = useState({});
  const [subnetId, setSubnetId] = useState("");
  const [nakamotoBefore, setNakamotoBefore] = useState([]);
  const [nakamotoAfter, setNakamotoAfter] = useState([]);

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
  }, [proposal_id]);

  useEffect(() => {
    target_topology_backend
      .nakamoto_report_for_proposal(Number(proposal_id))
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
  }, [proposal_id]);

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
        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h3">Nakamoto coefficients changes </Card.Title>
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
      <SubnetDetailWithNodes subnet_id={subnetId} />
    </Row>
  );
}
