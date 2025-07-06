import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, Image } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

interface AttendanceSubmissionData {
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  work_location: 'office' | 'home' | 'client_site';
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
  selfie?: File;
}

const AttendanceSubmission: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  
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

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'danger', text: 'Please select an image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'danger', text: 'Image size must be less than 5MB' });
        return;
      }

      setFormData(prev => ({
        ...prev,
        selfie: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelfiePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('date', formData.date);
      formDataToSend.append('work_location', formData.work_location);
      formDataToSend.append('status', formData.status);
      
      if (formData.check_in_time) {
        formDataToSend.append('check_in_time', formData.check_in_time);
      }
      if (formData.check_out_time) {
        formDataToSend.append('check_out_time', formData.check_out_time);
      }
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }
      if (formData.selfie) {
        formDataToSend.append('selfie', formData.selfie);
      }

      const response = await fetch('http://localhost:3003/attendance/submit', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
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
        setSelfiePreview(null);
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
            <Form.Label>Selfie (Optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleSelfieChange}
              className="mb-2"
            />
            <Form.Text className="text-muted">
              Upload a selfie to verify your attendance. Max size: 5MB. Supported formats: JPG, PNG, GIF
            </Form.Text>
            {selfiePreview && (
              <div className="mt-2">
                <Image 
                  src={selfiePreview} 
                  alt="Selfie preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                  className="border rounded"
                />
              </div>
            )}
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