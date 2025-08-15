// react-bootstrap
import { Row, Col, Card } from 'react-bootstrap';

// third party
import Chart from 'react-apexcharts';

// project imports
import FlatCard from '../../../components/Widgets/Statistic/FlatCard';
import FeedTable from '../../../components/Widgets/FeedTable';
import { NodeUtilization } from './chart/node-utilization';// -----------------------|| DASHBOARD Node utilization ||-----------------------//
export default function DashSales() {
  return (
    <Row>
      <Col md={12} xl={6}>
        <Card className="flat-card">
          <div className="row-table">
            <Card.Body className="col-sm-6 br">
              <FlatCard params={{ title: 'Nodes', iconClass: 'text-primary mb-1', icon: 'computer', value: '1000' }} />
            </Card.Body>
            <Card.Body className="col-sm-6 d-none d-md-table-cell d-lg-table-cell d-xl-table-cell card-body br">
              <FlatCard params={{ title: 'Subnets', iconClass: 'text-primary mb-1', icon: 'language', value: '1252' }} />
            </Card.Body>
            <Card.Body className="col-sm-6 card-bod">
              <FlatCard params={{ title: 'Open Proposals', iconClass: 'text-primary mb-1', icon: 'gavel', value: '600' }} />
            </Card.Body>
          </div>
          <div className="row-table">
            <Card.Body className="col-sm-6 br">
              <FlatCard
                params={{
                  title: 'Node providers',
                  iconClass: 'text-primary mb-1',
                  icon: 'supervised_user_circle',
                  value: '3550'
                }}
              />
            </Card.Body>
            <Card.Body className="col-sm-6 d-none d-md-table-cell d-lg-table-cell d-xl-table-cell card-body br">
              <FlatCard params={{ title: 'Countries', iconClass: 'text-primary mb-1', icon: 'flag', value: '3550' }} />
            </Card.Body>
            <Card.Body className="col-sm-6 card-bod">
              <FlatCard params={{ title: 'Data centers', iconClass: 'text-primary mb-1', icon: 'dns', value: '100%' }} />
            </Card.Body>
          </div>
        </Card>
        <Card>
          <Card.Body>
            <h6>Node utilization</h6>
            <Row className="d-flex justify-content-center align-items-center">
              <Col>
                <Chart type="pie" {...NodeUtilization()} />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
      <Col md={12} xl={6}>
        {/* Feed Table */}
        <FeedTable wrapclass="feed-card" height="385px" title="Open proposals" options={[
          {
            icon: "award",
            heading: "You have 3 pending tasks.",
            publishon: "Just now",
            link: "#"
          }
        ]} />
      </Col>
    </Row>
  );
}
