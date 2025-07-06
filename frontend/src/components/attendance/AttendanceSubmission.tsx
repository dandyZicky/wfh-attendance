import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

interface AttendanceSubmissionData {
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  work_location: 'office' | 'home' | 'client_site';
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
}

const AttendanceSubmission: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<AttendanceSubmissionData>({
    date: new Date().toISOString().split('T')[0], // Today's date
    work_location: 'home',
    status: 'present'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:3002/attendance/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Attendance submitted successfully!' });
        // Reset form to today's date
        setFormData(prev => ({
          ...prev,
          date: new Date().toISOString().split('T')[0],
          check_in_time: '',
          check_out_time: '',
          notes: ''
        }));
      } else {
        setMessage({ type: 'danger', text: data.msg || 'Failed to submit attendance' });
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setMessage({ type: 'danger', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">Submit Attendance</Card.Title>
      </Card.Header>
      <Card.Body>
        {message && (
          <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status *</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Check-in Time</Form.Label>
                <Form.Control
                  type="time"
                  name="check_in_time"
                  value={formData.check_in_time || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Check-out Time</Form.Label>
                <Form.Control
                  type="time"
                  name="check_out_time"
                  value={formData.check_out_time || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Work Location *</Form.Label>
            <Form.Select
              name="work_location"
              value={formData.work_location}
              onChange={handleInputChange}
              required
            >
              <option value="home">Work From Home</option>
              <option value="office">Office</option>
              <option value="client_site">Client Site</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              placeholder="Any additional notes or comments..."
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AttendanceSubmission; 