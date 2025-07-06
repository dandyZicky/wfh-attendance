import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Table, Modal, Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

interface Employee {
  id: number;
  user_key: string;
  username: string;
  email: string;
  department_id: number;
  department_name: string;
  first_name: string;
  last_name: string;
  hire_date: string;
  created_at: string;
}

interface Department {
  department_id: number;
  department_name: string;
}

const EmployeeManagement: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    department_id: '',
    first_name: '',
    last_name: ''
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/users', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      } else {
        setMessage({ type: 'danger', text: 'Failed to fetch employees' });
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setMessage({ type: 'danger', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:3001/departments', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Employee created successfully!' });
        setShowCreateModal(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          department_id: '',
          first_name: '',
          last_name: ''
        });
        fetchEmployees(); // Refresh the list
      } else {
        setMessage({ type: 'danger', text: data.msg || 'Failed to create employee' });
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      setMessage({ type: 'danger', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Employee Management</h2>
          <p className="text-muted">Create and manage employee accounts</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Add Employee
          </Button>
        </Col>
      </Row>

      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <Card.Title className="mb-0">Employee List</Card.Title>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Hire Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.first_name} {employee.last_name}</td>
                      <td>{employee.username}</td>
                      <td>{employee.email}</td>
                      <td>{employee.department_name}</td>
                      <td>{new Date(employee.hire_date).toLocaleDateString()}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-2">
                          Edit
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create Employee Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Employee</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateEmployee}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department *</Form.Label>
                  <Form.Select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Employee'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default EmployeeManagement; 