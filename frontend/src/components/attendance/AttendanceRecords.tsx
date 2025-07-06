import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

interface AttendanceRecord {
  id: number;
  user_key: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  work_location: 'office' | 'home' | 'client_site';
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee_name?: string; // For HR view
}

const AttendanceRecords: React.FC = () => {
  const { user, isHR } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    end_date: new Date().toISOString().split('T')[0], // Today
    user_key: '',
    department_id: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      // For regular employees, only show their own records
      if (!isHR) {
        params.append('user_key', user?.user_key || '');
      } else {
        // For HR, allow filtering by user and department
        if (filters.user_key) params.append('user_key', filters.user_key);
        if (filters.department_id) params.append('department_id', filters.department_id);
      }

      const response = await fetch(`http://localhost:3003/attendance/records?${params}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setRecords(data.data || []);
      } else {
        setMessage({ type: 'danger', text: data.msg || 'Failed to fetch attendance records' });
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setMessage({ type: 'danger', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: 'success',
      absent: 'danger',
      late: 'warning',
      half_day: 'info'
    };
    return <Badge bg={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getLocationBadge = (location: string) => {
    const variants = {
      home: 'primary',
      office: 'secondary',
      client_site: 'info'
    };
    return <Badge bg={variants[location as keyof typeof variants] || 'secondary'}>{location}</Badge>;
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">
          {isHR ? 'All Employee Attendance Records' : 'My Attendance Records'}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {message && (
          <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {isHR && (
          <Form onSubmit={handleFilterSubmit} className="mb-4">
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>User Key (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_key"
                    value={filters.user_key}
                    onChange={handleFilterChange}
                    placeholder="Enter user key"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Department ID (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    name="department_id"
                    value={filters.department_id}
                    onChange={handleFilterChange}
                    placeholder="Enter department ID"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Loading...' : 'Apply Filters'}
              </Button>
            </div>
          </Form>
        )}

        {!isHR && (
          <div className="mb-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button onClick={fetchRecords} variant="primary" disabled={loading}>
                {loading ? 'Loading...' : 'Refresh Records'}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : records.length === 0 ? (
          <Alert variant="info">
            {isHR 
              ? 'No attendance records found for the selected filters.' 
              : 'No attendance records found for the selected date range.'
            }
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  {isHR && <th>Employee</th>}
                  <th>Date</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Notes</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    {isHR && <td>{record.employee_name || record.user_key}</td>}
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{getStatusBadge(record.status)}</td>
                    <td>{getLocationBadge(record.work_location)}</td>
                    <td>{formatTime(record.check_in_time)}</td>
                    <td>{formatTime(record.check_out_time)}</td>
                    <td>{record.notes || '-'}</td>
                    <td>{new Date(record.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttendanceRecords; 