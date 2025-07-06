import React from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

      <Container>
        <Row>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>WFH Attendance Submission</Card.Title>
                <Card.Text>
                  Submit your Work From Home attendance for the day.
                </Card.Text>
                <Button variant="primary">Submit</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>WFH Attendance Viewer (HR Admin)</Card.Title>
                <Card.Text>
                  View all WFH attendance submissions.
                </Card.Text>
                <Button variant="secondary">View Submissions</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard; 