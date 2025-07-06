import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab, Card } from 'react-bootstrap';
import AttendanceSubmission from './AttendanceSubmission';
import AttendanceRecords from './AttendanceRecords';
import AttendanceStats from './AttendanceStats';

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('submission');

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h2 className="mb-0">Attendance Management</h2>
            </Card.Header>
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'submission')}>
                <Row>
                  <Col md={3}>
                    <Nav variant="pills" className="flex-column">
                      <Nav.Item>
                        <Nav.Link eventKey="submission">
                          Submit Attendance
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="records">
                          View Records
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="stats">
                          Statistics
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  <Col md={9}>
                    <Tab.Content>
                      <Tab.Pane eventKey="submission">
                        <AttendanceSubmission />
                      </Tab.Pane>
                      <Tab.Pane eventKey="records">
                        <AttendanceRecords />
                      </Tab.Pane>
                      <Tab.Pane eventKey="stats">
                        <AttendanceStats />
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AttendancePage; 