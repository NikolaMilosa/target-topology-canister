import { Card, Table } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import ReactCountryFlag from "react-country-flag";

export default function NodesTable({ nodes, title, subtitle }) {
  const tableHeadings = [
    "Node Id",
    "Data center",
    "Country",
    "DC owner",
    "Node Provider",
    "HostOS version",
  ];

  return (
    <Card className="table-card feed-card">
      <Card.Header>
        <Card.Title as="h3">{title}</Card.Title>
        <span>{subtitle}</span>
      </Card.Header>
      <Card.Body className="p-0">
        <SimpleBar
          style={{
            maxHeight: "513px",
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
  );
}
