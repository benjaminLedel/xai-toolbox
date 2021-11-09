import {Alert, Col, Container, Nav, Navbar, NavDropdown, Row} from "react-bootstrap";
import React from 'react';

class App extends React.Component {

    render() {
        return <div className="App">
            <Navbar bg="light" expand="lg">
  <Container>
    <Navbar.Brand href="#home">xAI Toolkit</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link href="#home">Dashboard</Nav.Link>
        <NavDropdown title="Toolkits" id="basic-nav-dropdown">
          <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
          <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
          <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
        </NavDropdown>
        <Nav.Link href="#link">About</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
            <Container>
  <Row>
    <Col>
                <Alert variant="success">
                    <Alert.Heading>Hey, nice to see you</Alert.Heading>
                    <p>
                        Aww yeah, you successfully read this important alert message. This example
                        text is going to run a bit longer so that you can see how spacing within an
                        alert works with this kind of content.
                    </p>
                    <hr/>
                    <p className="mb-0">
                        Whenever you need to, be sure to use margin utilities to keep things nice
                        and tidy.
                    </p>
                </Alert>
    </Col>
  </Row>
</Container>

        </div>
    }
}

export default App;
