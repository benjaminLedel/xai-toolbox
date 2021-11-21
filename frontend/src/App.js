import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import Home from "./pages/Home";
import Systemtest from "./pages/Systemtest";
import About from "./pages/About";

class App extends React.Component {

    render() {
        return <Router>
            <div className="App">
                <Navbar bg="light" expand="lg">
                    <Container>
                        <Link to="/" className={"navbar-brand"}>xAI Toolkit</Link>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Link to="/home" className={"nav-link"}>Dashboard</Link>
                                <NavDropdown title="Toolkits" id="basic-nav-dropdown">
                                    <Link to="/tools/evaluation" className={"dropdown-item"}>Evaluation</Link>
                                    <Link to="/tools/training" className={"dropdown-item"}>Training</Link>
                                    <NavDropdown.Divider/>
                                    <Link to="/tools/systemtest" className={"dropdown-item"}>System Test</Link>
                                </NavDropdown>
                                <Link to="/about" className={"nav-link"}>About</Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <Container>
                    <Switch>
                        <Route exact path="/">
                            <Systemtest/>
                        </Route>
                        <Route exact path="/home">
                            <Home/>
                        </Route>
                         <Route exact path="/about">
                            <About/>
                        </Route>
                        <Route path="/tools/systemtest">
                            <Systemtest/>
                        </Route>
                    </Switch>
                </Container>

            </div>
        </Router>
    }
}

export default App;
