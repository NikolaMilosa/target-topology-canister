import { Card, Col, Row } from "react-bootstrap";
import Chip from "@mui/material/Chip";
import { useEffect, useState } from "react";

import ProductCard from "../Widgets/Statistic/ProductCard";

export default function TargetTopologyConstraints({ topologyReport }) {
  const [targetTopologyConstraintsHold, setTargetTopologyConstraintsHold] =
    useState(false);

  useEffect(() => {
    setTargetTopologyConstraintsHold(
      topologyReport.every((x) => x.violations.length == 0),
    );
  }, [topologyReport]);

  return (
    <>
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
            Target topology constraints ensure that a subnet is well-distributed
            across different entities to maintain decentralization. Each subnet
            has limits for countries, data centers, data center owners, and node
            providers. If any of these attributes exceed their respective limit,
            the subnet does not comply with the target topology constraints.
            Proper adherence helps prevent centralization and increases network
            resilience.
          </span>
        </Card.Header>
        <Card.Body>
          <Row>
            {topologyReport.map((x, k) => (
              <Col sm={12} md={6} key={k}>
                <ProductCard
                  params={{
                    variant: x.violations.length == 0 ? "success" : "danger",
                    title: x.limit_name,
                    primaryText: x.limit_value,
                    icon: "layers",
                    secondaryText:
                      x.violations.length == 0 ? (
                        "Constraint is enforced."
                      ) : (
                        <>
                          <span>Violations found: </span>
                          <ul>
                            {x.violations.map((violation, j) => (
                              <li key={j}>
                                {x.limit_name == "Node provider"
                                  ? violation.value.split("-")[0]
                                  : violation.value}{" "}
                                was present {violation.found} times
                              </li>
                            ))}
                          </ul>
                        </>
                      ),
                  }}
                />
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </>
  );
}
