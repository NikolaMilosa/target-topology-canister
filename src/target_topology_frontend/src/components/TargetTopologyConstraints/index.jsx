import { Col } from "react-bootstrap";

import ProductCard from "../Widgets/Statistic/ProductCard";

export default function TargetTopologyConstraints({ topologyReport }) {
  return topologyReport.map((x, k) => (
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
  ));
}
