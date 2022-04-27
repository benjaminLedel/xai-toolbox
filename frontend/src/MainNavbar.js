import React, {Component} from "react";
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignInAlt, faWind} from "@fortawesome/free-solid-svg-icons";
import {connect} from "react-redux";

class MainNavbar extends Component {

    render() {
        console.log(this.props.store.user)
        return (
            <div>
                <Navbar bg="light" expand="lg">
                    <Container>
                        <Link to="/" className={"navbar-brand"}><FontAwesomeIcon icon={faWind}/> xAI Toolkit</Link>
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
                        <Navbar.Collapse className="justify-content-end">

                            <Navbar.Text>
                                <Link to="/login" className={"nav-link"}><FontAwesomeIcon
                                    icon={faSignInAlt}/> Login {this.props.store.user}</Link>
                            </Navbar.Text>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = state => ({store: state})

export default connect(mapStateToProps)(MainNavbar);
