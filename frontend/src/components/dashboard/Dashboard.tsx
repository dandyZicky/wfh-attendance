import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AttendancePage from '../attendance/AttendancePage';
import HRDashboard from './HRDashboard';

const Dashboard: React.FC = () => {
  const { user, logout, isHR } = useAuth();
  const navigate = useNavigate();
  const [showAttendance, setShowAttendance] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // If user is HR, show HR dashboard
  if (isHR) {
    return <HRDashboard />;
  }

  // Regular employee dashboard
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
                  <span className="text-light me-2">
                    Welcome, {user.username} {user.department_name && `(${user.department_name})`}
                  </span>
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
          <Row className="mb-4">
            <Col>
              <h2>Employee Dashboard</h2>
              <p className="text-muted">Manage your Work From Home attendance</p>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Submit Attendance</Card.Title>
                  <Card.Text>
                    Submit your daily Work From Home attendance with selfie verification, check-in/out times, and work location details.
                  </Card.Text>
                  <div className="mt-auto">
                    <Button 
                      variant="primary" 
                      onClick={() => setShowAttendance(true)}
                      className="w-100"
                    >
                      Submit Today's Attendance
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>View Records</Card.Title>
                  <Card.Text>
                    View your attendance history, check statistics, and download your attendance records for personal reference.
                  </Card.Text>
                  <div className="mt-auto">
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowAttendance(true)}
                      className="w-100"
                    >
                      View My Records
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mt-4">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Quick Stats</Card.Title>
                  <Card.Text>
                    <strong>This Month:</strong><br />
                    • WFH Days: Loading...<br />
                    • Office Days: Loading...<br />
                    • Attendance Rate: Loading...
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Today's Status</Card.Title>
                  <Card.Text>
                    <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
                    <strong>Status:</strong> <span className="text-muted">Not submitted yet</span><br />
                    <strong>Location:</strong> <span className="text-muted">-</span>
                  </Card.Text>
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