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
  const { user } = useAuth();
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
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.user_key) params.append('user_key', filters.user_key);
      if (filters.department_id) params.append('department_id', filters.department_id);

      const response = await fetch(`http://localhost:3002/attendance/stats?${params}`, {
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
        <Card.Title className="mb-0">Attendance Statistics</Card.Title>
      </Card.Header>
      <Card.Body>
        {message && (
          <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

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
              {loading ? 'Loading...' : 'Update Statistics'}
            </Button>
          </div>
        </Form>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : stats ? (
          <div>
            {/* Summary Cards */}
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-primary">{stats.total_days}</h3>
                    <p className="mb-0">Total Days</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-success">{stats.present_days}</h3>
                    <p className="mb-0">Present Days</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-warning">{stats.late_days}</h3>
                    <p className="mb-0">Late Days</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h3 className="text-danger">{stats.absent_days}</h3>
                    <p className="mb-0">Absent Days</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Progress Bars */}
            <Row className="mb-4">
              <Col md={6}>
                <h5>Attendance Rate</h5>
                <ProgressBar 
                  now={getAttendanceRate()} 
                  variant="success" 
                  label={`${getAttendanceRate()}%`}
                  className="mb-3"
                />
                <small className="text-muted">
                  {stats.present_days} out of {stats.total_days} days present
                </small>
              </Col>
              <Col md={6}>
                <h5>WFH Rate</h5>
                <ProgressBar 
                  now={getWFHRate()} 
                  variant="primary" 
                  label={`${getWFHRate()}%`}
                  className="mb-3"
                />
                <small className="text-muted">
                  {stats.wfh_days} out of {stats.total_days} days working from home
                </small>
              </Col>
            </Row>

            {/* Detailed Statistics */}
            <Row>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Attendance Breakdown</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Present</span>
                      <span className="text-success">{stats.present_days} ({calculatePercentage(stats.present_days, stats.total_days)}%)</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Late</span>
                      <span className="text-warning">{stats.late_days} ({calculatePercentage(stats.late_days, stats.total_days)}%)</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Half Day</span>
                      <span className="text-info">{stats.half_days} ({calculatePercentage(stats.half_days, stats.total_days)}%)</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Absent</span>
                      <span className="text-danger">{stats.absent_days} ({calculatePercentage(stats.absent_days, stats.total_days)}%)</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Work Location Breakdown</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Work From Home</span>
                      <span className="text-primary">{stats.wfh_days} ({calculatePercentage(stats.wfh_days, stats.total_days)}%)</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Office</span>
                      <span className="text-secondary">{stats.office_days} ({calculatePercentage(stats.office_days, stats.total_days)}%)</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Client Site</span>
                      <span className="text-info">
                        {stats.total_days - stats.wfh_days - stats.office_days} ({calculatePercentage(stats.total_days - stats.wfh_days - stats.office_days, stats.total_days)}%)
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          <Alert variant="info">No statistics available for the selected filters.</Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttendanceStats; 