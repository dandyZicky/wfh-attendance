import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AttendancePage from '../attendance/AttendancePage';
import EmployeeManagement from './EmployeeManagement';

const HRDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'attendance' | 'employees' | 'all-attendance'>('dashboard');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'attendance':
        return (
          <div>
            <div className="mb-3">
              <Button variant="outline-secondary" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
            </div>
            <AttendancePage />
          </div>
        );
      case 'employees':
        return (
          <div>
            <div className="mb-3">
              <Button variant="outline-secondary" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
            </div>
            <EmployeeManagement />
          </div>
        );
      case 'all-attendance':
        return (
          <div>
            <div className="mb-3">
              <Button variant="outline-secondary" onClick={() => setActiveView('dashboard')}>
                ← Back to Dashboard
              </Button>
            </div>
            <AttendancePage />
          </div>
        );
      default:
        return (
          <Container>
            <Row className="mb-4">
              <Col>
                <h2>HR Dashboard</h2>
                <p className="text-muted">Welcome to the Human Resources Management Portal</p>
              </Col>
            </Row>
            
            <Row>
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>Employee Management</Card.Title>
                    <Card.Text>
                      Create new employees, update employee information, and manage department assignments.
                    </Card.Text>
                    <div className="mt-auto">
                      <Button 
                        variant="primary" 
                        onClick={() => setActiveView('employees')}
                        className="w-100"
                      >
                        Manage Employees
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>My Attendance</Card.Title>
                    <Card.Text>
                      Submit your own daily attendance, view your records, and check your WFH statistics.
                    </Card.Text>
                    <div className="mt-auto">
                      <Button 
                        variant="success" 
                        onClick={() => setActiveView('attendance')}
                        className="w-100"
                      >
                        Submit My Attendance
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>All Employee Attendance</Card.Title>
                    <Card.Text>
                      View all employee attendance records, monitor WFH statistics, and generate reports.
                    </Card.Text>
                    <div className="mt-auto">
                      <Button 
                        variant="warning" 
                        onClick={() => setActiveView('all-attendance')}
                        className="w-100"
                      >
                        View All Records
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>Reports & Analytics</Card.Title>
                    <Card.Text>
                      Generate attendance reports, view department statistics, and export data for analysis.
                    </Card.Text>
                    <div className="mt-auto">
                      <Button 
                        variant="info" 
                        onClick={() => setActiveView('all-attendance')}
                        className="w-100"
                      >
                        Generate Reports
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
                      <strong>Total Employees:</strong> Loading...<br />
                      <strong>Active WFH Today:</strong> Loading...<br />
                      <strong>Pending Approvals:</strong> Loading...
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Recent Activity</Card.Title>
                    <Card.Text>
                      <small className="text-muted">No recent activity to display</small>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        );
    }
  };

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>WFH Attendance System - HR Portal</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {user && (
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-light me-2">
                    Welcome, {user.username} ({user.department_name})
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

      {renderContent()}
    </div>
  );
};

export default HRDashboard; 