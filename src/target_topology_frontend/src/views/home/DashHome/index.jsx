// react-bootstrap
import { Row, Col, Card } from "react-bootstrap";

// third party
import Chart from "react-apexcharts";

// project imports
import FlatCard from "../../../components/Widgets/Statistic/FlatCard";
import FeedTable from "../../../components/Widgets/FeedTable";
import ProductCard from "../../../components/Widgets/Statistic/ProductCard";
import { NodeUtilization } from "./chart/node-utilization"; // -----------------------|| DASHBOARD Node utilization ||-----------------------//
import { target_topology_backend } from "declarations/target_topology_backend";
import { useEffect, useState } from "react";

function timeAgo(bigSeconds) {
  const seconds = Number(bigSeconds);
  const now = Number(Math.floor(Date.now() / 1000)); // current time in seconds as BigInt
  const secondsAgo = now - seconds;
  const minutes = Math.floor(secondsAgo / 60);
  const hours = Math.floor(secondsAgo / 3600);
  const days = Math.floor(secondsAgo / 86400);

  if (seconds < 60) return `${secondsAgo} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

export default function DashSales() {
  const [totalNodes, setTotalNodes] = useState(0);
  const [totalSubnets, setTotalSubnets] = useState(0);
  const [totalNodeProviders, setTotalNodeProviders] = useState(0);
  const [totalCountries, setTotalCountries] = useState(0);
  const [totalDataCenters, setTotalDataCenters] = useState(0);
  const [openProposals, setOpenProposals] = useState([]);
  const [nodeSeries, setNodeSeries] = useState([]);
  const [activeTopology, setActiveTopology] = useState("");

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

        const nodes_in_subnet = nodes.reduce(
          (acc, i) => acc + (i.subnet_id.length > 0 ? 1 : 0),
          0,
        );
        const api_bns = nodes.reduce(
          (acc, i) => acc + (i.is_api_bn === true ? 1 : 0),
          0,
        );
        const unassigned = nodes.length - nodes_in_subnet - api_bns;

        setNodeSeries([nodes_in_subnet, unassigned, api_bns]);
      });

      target_topology_backend.get_proposals().then((proposals) => {
        const props = proposals
          .sort((a, b) => Number(b.id) - Number(a.id))
          .map((p) => ({
            icon: "award",
            heading: `[${p.id}] ${p.title}`,
            publishon: timeAgo(p.timestamp_seconds),
            link: `/proposal/${p.id}`,
          }));
        setOpenProposals(props);
      });

      target_topology_backend.get_active_topology().then((topology) => {
        const proposal = topology.length > 0 ? topology[0].proposal : "Unknown";
        setActiveTopology(proposal);
      });
    }

    fetchData();

    const interval = setInterval(async () => {
      try {
        await fetchData();
      } catch (err) {
        console.error("Failed to fetch home dashboard data", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Row>
      <Col sm={12}>
        <Card className="flat-card">
          <Card.Header>
            <Card.Title as="h1">Target topology dashboard</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Text className="text-muted mb-4">
              Internet computer target topology dashboard is a single place to
              get information about proposals and their statuses. Here you can
              find information about target topology constraints, nakamoto
              coefficients and more. It is developed and maintained by the DRE
              team.
            </Card.Text>
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
                  title: "Open Proposals",
                  iconClass: "text-primary mb-1",
                  icon: "gavel",
                  value: openProposals.length,
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
                  title: "Open Proposals",
                  iconClass: "text-primary mb-1",
                  icon: "gavel",
                  value: openProposals.length,
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
          <Card.Body>
            <h6>Node utilization</h6>
            <Row className="d-flex justify-content-center align-items-center">
              <Col>
                <Chart type="pie" {...NodeUtilization(nodeSeries)} />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
      <Col md={12} xl={6}>
        {/* Feed Table */}
        <FeedTable
          wrapclass="feed-card"
          height="358px"
          title="Open proposals"
          options={openProposals}
        />
        <a
          href={`https://dashboard.internetcomputer.org/proposal/${activeTopology}`}
        >
          <ProductCard
            params={{
              title: "Active topology motion proposal",
              variant: "primary",
              primaryText: activeTopology,
              icon: "map",
            }}
          />
        </a>
      </Col>
    </Row>
  );
}
