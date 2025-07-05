import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
      <Container className="mt-5">
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
}

export default App;
