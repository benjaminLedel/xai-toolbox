import React, {Component} from "react";
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignInAlt, faUser, faWind} from "@fortawesome/free-solid-svg-icons";
import {connect} from "react-redux";
import EventManager from "./EventManager";
import {GENERAL_SET_CURRENT_USER} from "./redux/store";

class MainNavbar extends Component {

    logout() {
        localStorage.removeItem("auth_token")
        EventManager.fireLogoutEvent();
        this.props.updateCurrentUser(null)
    }

    render() {
        return (
            <div>
                <Navbar bg="light" expand="lg">
                    <Container>
                        <Link to="/" className={"navbar-brand"}><FontAwesomeIcon icon={faWind}/> xAI Toolbox</Link>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            {this.props.store.user ?
                                <Nav className="me-auto">
                                    <Link to="/home" className={"nav-link"}>Dashboard</Link>
                                    <NavDropdown title="Toolbox" id="basic-nav-dropdown">
                                        <Link to="/tools/evaluation" className={"dropdown-item"}>Start labeling</Link>
                                        <NavDropdown.Divider/>
                                        <Link to="/tools/systemtest" className={"dropdown-item"}>System Test</Link>
                                    </NavDropdown>
                                    <Link to="/help" className={"nav-link"}>Help</Link>
                                </Nav> :
                                <Nav className="me-auto">
                                    <Link to="/home" className={"nav-link"}>Home</Link>
                                    <Link to="/about" className={"nav-link"}>About</Link>
                                </Nav>
                            }
                        </Navbar.Collapse>
                        <Navbar.Collapse className="justify-content-end">

                            {this.props.store.user ?
                                <NavDropdown title={<span style={{color: "#000"}}><FontAwesomeIcon
                                    icon={faUser}/> {this.props.store.user.email}</span>} id="logoutDropDown">
                                    <Link to="/profile" className={"dropdown-item"}>Profil</Link>
                                    <NavDropdown.Divider/>
                                    <NavDropdown.Item onClick={() => this.logout()} className={"dropdown-item"}>Logout</NavDropdown.Item>
                                </NavDropdown> : <Navbar.Text>
                                    <Link to="/login" className={"nav-link"}><FontAwesomeIcon
                                        icon={faSignInAlt}/> Login</Link>
                                </Navbar.Text>
                            }
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = state => ({store: state})

const mapDispatchToProps = dispatch => {
    return {
        // dispatching plain actions
        updateCurrentUser: (currentUser) => dispatch({type: GENERAL_SET_CURRENT_USER, payload: currentUser}),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MainNavbar);
