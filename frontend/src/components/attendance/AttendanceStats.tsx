import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  half_days: number;
  wfh_days: number;
  office_days: number;
}

const AttendanceStats: React.FC = () => {
  const { user, isHR } = useAuth();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    end_date: new Date().toISOString().split('T')[0], // Today
    user_key: '',
    department_id: ''
  });

  const fetchStats = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const params = new URLSearchParams();
      params.append('start_date', filters.start_date);
      params.append('end_date', filters.end_date);
      
      // For regular employees, only show their own stats
      if (!isHR) {
        params.append('user_key', user?.user_key || '');
      } else {
        // For HR, allow filtering by user and department
        if (filters.user_key) params.append('user_key', filters.user_key);
        if (filters.department_id) params.append('department_id', filters.department_id);
      }

      const response = await fetch(`http://localhost:3003/attendance/stats?${params}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.data);
      } else {
        setMessage({ type: 'danger', text: data.msg || 'Failed to fetch attendance statistics' });
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      setMessage({ type: 'danger', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
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
    fetchStats();
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getAttendanceRate = () => {
    if (!stats) return 0;
    return calculatePercentage(stats.present_days, stats.total_days);
  };

  const getWFHRate = () => {
    if (!stats) return 0;
    return calculatePercentage(stats.wfh_days, stats.total_days);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">
          {isHR ? 'Department Attendance Statistics' : 'My Attendance Statistics'}
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
              <Button onClick={fetchStats} variant="primary" disabled={loading}>
                {loading ? 'Loading...' : 'Refresh Stats'}
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
        ) : stats ? (
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Attendance Overview</Card.Title>
                  <div className="row text-center">
                    <div className="col-4">
                      <h4 className="text-success">{stats.present_days}</h4>
                      <small>Present</small>
                    </div>
                    <div className="col-4">
                      <h4 className="text-danger">{stats.absent_days}</h4>
                      <small>Absent</small>
                    </div>
                    <div className="col-4">
                      <h4 className="text-warning">{stats.late_days}</h4>
                      <small>Late</small>
                    </div>
                  </div>
                  <div className="mt-3">
                    <strong>Attendance Rate:</strong> {calculatePercentage(stats.present_days, stats.total_days)}%
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Work Location</Card.Title>
                  <div className="row text-center">
                    <div className="col-6">
                      <h4 className="text-primary">{stats.wfh_days}</h4>
                      <small>WFH Days</small>
                    </div>
                    <div className="col-6">
                      <h4 className="text-secondary">{stats.office_days}</h4>
                      <small>Office Days</small>
                    </div>
                  </div>
                  <div className="mt-3">
                    <strong>WFH Rate:</strong> {calculatePercentage(stats.wfh_days, stats.total_days)}%
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Alert variant="info">
            {isHR 
              ? 'No attendance statistics found for the selected filters.' 
              : 'No attendance statistics found for the selected date range.'
            }
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttendanceStats; 