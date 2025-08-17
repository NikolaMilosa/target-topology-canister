import { Card, Row, Col } from "react-bootstrap";
import ProductCard from "../Widgets/Statistic/ProductCard";

export default function NakamotoBreakdown({ nakamoto }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title as="h3">Nakamoto coefficients breakdown</Card.Title>
        <span>
          Shows how many independent entities would need to collude to
          compromise decentralization. A higher coefficient means stronger
          decentralization and resilience against control. To read more visit{" "}
          <a href="https://www.ledger.com/academy/glossary/nakamoto-coefficient">
            Ledger academy
          </a>
          .{" "}
        </span>
      </Card.Header>
      <Card.Body>
        <Row>
          {nakamoto.map((x) => (
            <Col sm={12} md={6}>
              <ProductCard
                params={{
                  variant: "secondary",
                  title: x.attribute,
                  primaryText: x.value,
                  icon: "network_check",
                  secondaryText: `It would take at least ${x.value} to influence this subnet.`,
                }}
              />
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
}
