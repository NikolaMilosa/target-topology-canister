import { Card, Row, Col } from "react-bootstrap";
import ProductCard from "../Widgets/Statistic/ProductCard";

export default function NakamotoBreakdown({ nakamoto }) {
  return (
    <Row>
      {nakamoto.map((x) => (
        <Col sm={12} md={6}>
          <ProductCard
            params={{
              variant: x.variant,
              title: x.attribute,
              primaryText: x.value,
              icon: "network_check",
              secondaryText: `It would take at least ${x.value} to influence this subnet.`,
            }}
          />
        </Col>
      ))}
    </Row>
  );
}
