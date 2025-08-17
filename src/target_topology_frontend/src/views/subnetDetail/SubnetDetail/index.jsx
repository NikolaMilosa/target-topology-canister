// react-bootstrap
import { Row, Col, Card, Table, Stack } from 'react-bootstrap';

// project imports
import { target_topology_backend } from 'declarations/target_topology_backend';
import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import FlatCard from '../../../components/Widgets/Statistic/FlatCard';
import ProductCard from '../../../components/Widgets/Statistic/ProductCard';
import ReactCountryFlag from 'react-country-flag';
import { Principal } from '@dfinity/principal';

import Chip from '@mui/material/Chip';

export default function SubnetDetail() {
  const {subnet_id} = useParams();
  const subnet_short = subnet_id.split('-')[0];
  const tableHeadings = ["Node Id", "Data center", "Country", "DC owner", "Node Provider", "HostOS version"];
  const [nodes, setNodes] = useState([]);
  const [subnetTopology, setSubnetTopology] = useState({});
  const [nakamoto, setNakamoto] = useState([]);
  const [topologyReport, setTopologyReport] = useState([]);
  const [targetTopologyConstraintsHold, setTargetTopologyConstraintsHold] = useState(false);

  useEffect(() => {
    target_topology_backend.get_nodes_for_subnet(Principal.fromText(subnet_id)).then((nodes) => {
      if (nodes.length == 0) {
        return;
      }

      setNodes(nodes[0].map((node) => {
        return {
        "node_id": String(node["node_id"]),
        "dc_id": node["dc_id"],
        "dc_owner": node["dc_owner"],
        "hostos_version": node["hostos_version"],
        "ip": node["ip"],
        "node_operator_id": String(node["node_operator_id"]),
        "node_provider_id": String(node["node_provider_id"]),
        "country": node["country"],
      }}));
    });

    target_topology_backend.get_active_topology().then((topology) => {
      if (topology.length == 0) {
        return;
      }

      const currTopology = topology[0]["entries"].find(entry => String(entry["0"]) === subnet_id)["1"];
      currTopology.proposal = topology[0]["proposal"];
      setSubnetTopology(currTopology);
    });

    target_topology_backend.get_nakamoto_for_subnet(Principal.fromText(subnet_id)).then((nakamoto) => {
      if (nakamoto.length == 0) {
        return;
      }
    
      setNakamoto(nakamoto[0]);
    });

    target_topology_backend.get_topology_report(Principal.fromText(subnet_id)).then((topologyReport) => {
      if (topologyReport.length == 0) {
        return;
      }

      setTopologyReport(topologyReport[0]);
      setTargetTopologyConstraintsHold(topologyReport[0].every((report) => report.violations.length == 0));
    });
  }, [subnet_id]);
  
  return (
    <Row>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header>
              <Card.Title as="h1">Subnets <code className="d-none d-md-inline">{subnet_id}</code> <code className="d-md-none">{subnet_short}</code></Card.Title>
            </Card.Header>
            <Card.Body>
              This panel has all the information about subnet <code className="d-none d-md-inline">{subnet_id}</code><code className="d-md-none">{subnet_short}</code>. <br className="d-none d-md-inline"/>
              For more information visit the <a href={`https://dashboard.internetcomputer.org/network/subnets/${subnet_id}`}>public dashboard</a>.
            </Card.Body>
            <Card.Footer>
              Tags: 
              <Chip label={subnetTopology.subnet_type} size="small" color="primary" sx={{ mr: 1, ml: 1}} />
              {subnetTopology.is_sev && <Chip label="SEV-SNP" size="small" color="primary" />}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm={6} md={3}>
          <ProductCard params={{ variant: 'primary', title: 'Country limit', primaryText: `${subnetTopology["subnet_limit_country"]}`, icon: 'map' }} />
        </Col>
        <Col md={3} sm={6}>
          <ProductCard params={{ variant: 'primary', title: 'Data center limit', primaryText: `${subnetTopology.subnet_limit_data_center}`, icon: 'computer' }} />
        </Col>
        <Col sm={6} md={3}>
          <ProductCard params={{ variant: 'primary', title: 'Data center owner limit', primaryText: `${subnetTopology.subnet_limit_data_center_owner}`, icon: 'group' }} />
        </Col>
        <Col sm={6} md={3}>
          <ProductCard params={{ variant: 'primary', title: 'Node provider limit', primaryText: `${subnetTopology.subnet_limit_node_provider}`, icon: 'person' }} />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Card className="table-card feed-card" >
            <Card.Header>
              <Card.Title as="h3">Nodes</Card.Title>
              <span>List of nodes that are a part of the subnet.</span>
            </Card.Header>
            <Card.Body className="p-0">
              <SimpleBar style={{
                height: "513px",
              }}>
                <Table responsive className="mb-0 table table-striped" style={{ whiteSpace: "nowrap", minWidth: 800}}>
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
                          <a href={`https://dashboard.internetcomputer.org/node/${y.node_id}`}>
                            <code>{y.node_id}</code>
                          </a>
                        </td>
                        <td>
                          <a href={`https://dashboard.internetcomputer.org/network/centers/${y.dc_id}`}>
                          {y.dc_id}
                          </a>
                        </td>
                        <td>
                          <ReactCountryFlag countryCode={y.country}/></td>
                        <td>{y.dc_owner}</td>
                        <td>
                          <a href={`https://dashboard.internetcomputer.org/network/providers/${y.node_provider_id}`}>
                          <code>{y.node_provider_id}</code>
                          </a>
                          </td>
                        <td><code>{y.hostos_version}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </SimpleBar>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h3">Target topology constraints
                <Chip label={targetTopologyConstraintsHold ? "Enforced" : "Not enforced"} size="small" color={targetTopologyConstraintsHold ? "success" : "error"} sx={{ mr: 1, ml: 1}} />

              </Card.Title>
              <span>Target topology constraints ensure that a subnet is well-distributed across different entities to maintain decentralization. Each subnet has limits for countries, data centers, data center owners, and node providers. If any of these attributes exceed their respective limit, the subnet does not comply with the target topology constraints. Proper adherence helps prevent centralization and increases network resilience.</span>
            </Card.Header>
            <Card.Body>
              <Row>
                {topologyReport.map((x, k) => (
                  <Col sm={12} md={6} key={k}>
                    <ProductCard params={{ variant: x.violations.length == 0 ? 'success' : 'danger', title: x.limit_name, primaryText: x.limit_value, icon: 'network_check', secondaryText: x.violations.length == 0 ? 'Constraint is enforced.' : (
                      <>
                        <span>Violations found: </span>
                        <ul>
                          {x.violations.map((violation, j) => (
                            <li key={j}>{
                              x.limit_name == "Node provider" ? violation.value.split('-')[0] : violation.value
                            } was present {violation.found} times</li>
                          ))}
                        </ul>
                      </>
                    ) }} />
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={12} md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h3">Nakamoto coefficients breakdown</Card.Title>
              <span>Shows how many independent entities would need to collude to compromise decentralization. A higher coefficient means stronger decentralization and resilience against control. To read more visit <a href="https://www.ledger.com/academy/glossary/nakamoto-coefficient">Ledger academy</a>. </span>
            </Card.Header>
            <Card.Body>
              <Row>
                {nakamoto.map((x) => (
                  <Col sm={12} md={6}>
                    <ProductCard params={{ variant: 'secondary', title: x.attribute, primaryText: x.value, icon: 'network_check', secondaryText: `It would take at least ${x.value} to influence this subnet.` }} />
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Row>
  );
}
