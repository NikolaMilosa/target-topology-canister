import { Row, Col, Card, Table } from "react-bootstrap";

import ProductCard from "../../../components/Widgets/Statistic/ProductCard";
import ReactCountryFlag from "react-country-flag";
import SimpleBar from "simplebar-react";

import Chip from "@mui/material/Chip";

export default function SubnetDetailWithNodes({
  subnet_id,
  nodes,
  subnetTopology,
}) {
  const subnet_short = subnet_id.split("-")[0];
  const tableHeadings = [
    "Node Id",
    "Data center",
    "Country",
    "DC owner",
    "Node Provider",
    "HostOS version",
  ];

  return (
    <Row>
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
              .
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
          <Card className="table-card feed-card">
            <Card.Header>
              <Card.Title as="h3">Nodes</Card.Title>
              <span>List of nodes that are a part of the subnet.</span>
            </Card.Header>
            <Card.Body className="p-0">
              <SimpleBar
                style={{
                  height: "513px",
                }}
              >
                <Table
                  responsive
                  className="mb-0 table table-striped"
                  style={{ whiteSpace: "nowrap", minWidth: 800 }}
                >
                  <thead>
                    <tr>
                      {tableHeadings.map((x, i) => (
                        <th key={i}>{x}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((y, j) => (
                      <tr key={j}>
                        <td>
                          <a
                            href={`https://dashboard.internetcomputer.org/node/${y.node_id}`}
                          >
                            <code>{y.node_id}</code>
                          </a>
                        </td>
                        <td>
                          <a
                            href={`https://dashboard.internetcomputer.org/network/centers/${y.dc_id}`}
                          >
                            {y.dc_id}
                          </a>
                        </td>
                        <td>
                          <ReactCountryFlag countryCode={y.country} />
                        </td>
                        <td>{y.dc_owner}</td>
                        <td>
                          <a
                            href={`https://dashboard.internetcomputer.org/network/providers/${y.node_provider_id}`}
                          >
                            <code>{y.node_provider_id}</code>
                          </a>
                        </td>
                        <td>
                          <code>{y.hostos_version}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </SimpleBar>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Row>
  );
}
