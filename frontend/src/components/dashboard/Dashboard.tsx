import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AttendancePage from '../attendance/AttendancePage';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAttendance, setShowAttendance] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>WFH Attendance System</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {user && (
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-light me-2">Welcome, {user.username}</span>
                </Nav.Item>
              )}
              <Nav.Item>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {showAttendance ? (
        <div>
          <div className="mb-3">
            <Button variant="outline-secondary" onClick={() => setShowAttendance(false)}>
              ← Back to Dashboard
            </Button>
          </div>
          <AttendancePage />
        </div>
      ) : (
        <Container>
          <Row>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>WFH Attendance Management</Card.Title>
                  <Card.Text>
                    Submit your Work From Home attendance, view records, and check statistics.
                  </Card.Text>
                  <Button variant="primary" onClick={() => setShowAttendance(true)}>
                    Manage Attendance
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Quick Actions</Card.Title>
                  <Card.Text>
                    Access attendance features and system management.
                  </Card.Text>
                  <Button variant="secondary" onClick={() => setShowAttendance(true)}>
                    View Attendance
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default Dashboard; 