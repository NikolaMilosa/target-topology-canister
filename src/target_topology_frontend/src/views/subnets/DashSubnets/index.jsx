// react-bootstrap
import { Row, Col, Card, Table } from "react-bootstrap";

// project imports
import FlatCard from "../../../components/Widgets/Statistic/FlatCard";
import ProductCard from "../../../components/Widgets/Statistic/ProductCard";
import { target_topology_backend } from "declarations/target_topology_backend";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SimpleBar from "simplebar-react";

export default function DashSales() {
  const [totalNodes, setTotalNodes] = useState(0);
  const [totalSubnets, setTotalSubnets] = useState(0);
  const [totalNodeProviders, setTotalNodeProviders] = useState(0);
  const [totalCountries, setTotalCountries] = useState(0);
  const [totalDataCenters, setTotalDataCenters] = useState(0);
  const [totalDataCenterProviders, setTotalDataCenterProviders] = useState(0);

  const [nodesInSubnets, setNodesInSubnets] = useState(0);
  const [unassignedNodes, setUnassignedNodes] = useState(0);
  const [apiBns, setApiBns] = useState(0);

  const tableHeadings = ["Subnet Id", "Subnet type", "Dashboard"];
  const [subnets, setSubnets] = useState([]);

  useEffect(() => {
    async function fetchData() {
      target_topology_backend.get_nodes().then((nodes) => {
        setTotalNodes(nodes.length);

        const subnets = [
          ...new Set(
            nodes
              .map((n) => n.subnet_id)
              .filter((s) => s.length > 0)
              .map((s) => String(s)),
          ),
        ];
        setTotalSubnets(subnets.length);

        const node_providers = [
          ...new Set(
            nodes.map((n) => n.node_provider_id).map((s) => String(s)),
          ),
        ];
        setTotalNodeProviders(node_providers.length);

        const countries = [...new Set(nodes.map((n) => n.country))];
        setTotalCountries(countries.length);

        const data_centers = [...new Set(nodes.map((n) => n.dc_id))];
        setTotalDataCenters(data_centers.length);

        const dc_providers = [...new Set(nodes.map((n) => n.dc_owner))];
        setTotalDataCenterProviders(dc_providers.length);

        const nodes_in_subnet = nodes.reduce(
          (acc, i) => acc + (i.subnet_id.length > 0 ? 1 : 0),
          0,
        );
        const api_bns = nodes.reduce(
          (acc, i) => acc + (i.is_api_bn === true ? 1 : 0),
          0,
        );
        const unassigned = nodes.length - nodes_in_subnet - api_bns;

        setNodesInSubnets(
          Math.round((nodes_in_subnet * 10000) / nodes.length) / 100,
        );
        setUnassignedNodes(
          Math.round((unassigned * 10000) / nodes.length) / 100,
        );
        setApiBns(Math.round((api_bns * 10000) / nodes.length) / 100);
      });

      target_topology_backend.get_active_topology().then((topology) => {
        if (topology.length < 0) {
          return;
        }

        setSubnets(
          topology[0].entries
            .map((node) => {
              const subnet = String(node[1].subnet_id);
              return {
                subnet_id: subnet,
                number_of_nodes: node[1].subnet_size,
                subnet_short: subnet.split("-")[0],
                subnet_type: node[1].subnet_type,
              };
            })
            .sort((a, b) => b.number_of_nodes - a.number_of_nodes),
        );
      });
    }

    fetchData();

    const interval = setInterval(async () => {
      try {
        await fetchData();
      } catch (err) {
        console.error("Failed to fetch subnets dashboard data", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Row>
      <Col sm={12}>
        <Card className="flat-card">
          <Card.Header>
            <Card.Title as="h1">Subnets view</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Text className="text-muted mb-4">
              Find general information about subnets here.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={12} xl={6}>
        <Card className="table-card feed-card">
          <Card.Header>
            <Card.Title as="h3">Subnets</Card.Title>
            <span>
              List of subnets on the IC. Links point to more information on the
              public dashboard.
            </span>
          </Card.Header>
          <Card.Body className="p-0">
            <SimpleBar
              style={{
                height: "513px",
              }}
            >
              <Table responsive className="mb-0 table table-striped">
                <thead>
                  <tr>
                    {tableHeadings.map((x, i) => (
                      <th key={i}>{x}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subnets.map((y, j) => (
                    <tr key={j}>
                      <td className="d-none d-md-table-cell d-lg-table-cell d-xl-table-cell">
                        <Link to={`/subnet/${y.subnet_id}`}>
                          <code>{y.subnet_id}</code> ({y.number_of_nodes})
                        </Link>
                      </td>
                      <td className="d-md-none">
                        <Link to={`/subnet/${y.subnet_id}`}>
                          <code>{y.subnet_short}</code> ({y.number_of_nodes})
                        </Link>
                      </td>
                      <td>{y.subnet_type}</td>
                      <td>
                        {" "}
                        <a
                          href={`https://dashboard.internetcomputer.org/network/subnets/${y.subnet_id}`}
                        >
                          <i class="material-icons-two-tone">launch</i>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </SimpleBar>
          </Card.Body>
        </Card>
      </Col>
      <Col md={12} xl={6}>
        <Card className="flat-card">
          <div className="row-table">
            <Card.Body className="col-sm-6 br">
              <FlatCard
                params={{
                  title: "Nodes",
                  iconClass: "text-primary mb-1",
                  icon: "computer",
                  value: totalNodes,
                }}
              />
            </Card.Body>
            <Card.Body className="col-sm-6 br">
              <FlatCard
                params={{
                  title: "Subnets",
                  iconClass: "text-primary mb-1",
                  icon: "language",
                  value: totalSubnets,
                }}
              />
            </Card.Body>
            <Card.Body className="col-sm-6 d-none d-md-table-cell d-lg-table-cell d-xl-table-cell  br">
              <FlatCard
                params={{
                  title: "DC owners",
                  iconClass: "text-primary mb-1",
                  icon: "group",
                  value: totalDataCenterProviders,
                }}
              />
            </Card.Body>
          </div>
          <div className="row-table">
            <Card.Body className="col-sm-6 br">
              <FlatCard
                params={{
                  title: "Node providers",
                  iconClass: "text-primary mb-1",
                  icon: "supervised_user_circle",
                  value: totalNodeProviders,
                }}
              />
            </Card.Body>
            <Card.Body className="col-sm-6 br">
              <FlatCard
                params={{
                  title: "Countries",
                  iconClass: "text-primary mb-1",
                  icon: "flag",
                  value: totalCountries,
                }}
              />
            </Card.Body>
            <Card.Body className="col-sm-6 d-none d-md-table-cell d-lg-table-cell d-xl-table-cell  br">
              <FlatCard
                params={{
                  title: "Data centers",
                  iconClass: "text-primary mb-1",
                  icon: "dns",
                  value: totalDataCenters,
                }}
              />
            </Card.Body>
          </div>
          <div className="row-table d-md-none">
            <Card.Body className="col-sm-6 br">
              <FlatCard
                params={{
                  title: "DC owners",
                  iconClass: "text-primary mb-1",
                  icon: "group",
                  value: totalDataCenterProviders,
                }}
              />
            </Card.Body>

            <Card.Body className="col-sm-6 br">
              <FlatCard
                params={{
                  title: "Data centers",
                  iconClass: "text-primary mb-1",
                  icon: "dns",
                  value: totalDataCenters,
                }}
              />
            </Card.Body>
          </div>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title as="h4">Node utilization</Card.Title>
            <span>Percentage of nodes used for across the network.</span>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} sm={12}>
                <ProductCard
                  params={{
                    variant: "primary",
                    title: "Nodes in subnets",
                    primaryText: `${nodesInSubnets}%`,
                    icon: "computer",
                  }}
                />
              </Col>
              <Col md={6} sm={12}>
                <ProductCard
                  params={{
                    variant: "primary",
                    title: "Unassigned nodes",
                    primaryText: `${unassignedNodes}%`,
                    icon: "computer",
                  }}
                />
              </Col>
              <Col sm={12}>
                <ProductCard
                  params={{
                    variant: "primary",
                    title: "Api boundary nodes",
                    primaryText: `${apiBns}%`,
                    icon: "language",
                  }}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
