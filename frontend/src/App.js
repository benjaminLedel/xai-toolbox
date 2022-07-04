import React, {lazy, Suspense} from "react";
import {
    BrowserRouter as Router,
    Route,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import AppGateway from "./AppGateway";
import MainNavbar from "./MainNavbar";
import {Container} from "react-bootstrap";
import XAILoading from "./xAILoading";
import {NotificationContainer} from 'react-notifications';

export const BASE_ROUTES =
    {
        ROOT: "/",
        LOGIN: "/login",
        TOOLS_EVALUATION: "/tools/evaluation",
        TOOLS_TRAINING: "/tools/training",
        TOOLS_SYSTEMTEST: "/tools/systemtest",
    }


class App extends React.Component {

    render() {
        return <Router>
            <NotificationContainer/>
            <div className="App">
                <MainNavbar>
                    <Container>
                    <Suspense fallback={<XAILoading/>}>
                        <Route exact path="/">
                            <Home/>
                        </Route>
                        <Route exact path="/home">
                            <Home/>
                        </Route>
                        <Route exact path="/about">
                            <About/>
                        </Route>
                        <Route exact path="/login">
                            <Login/>
                        </Route>
                        <ProtectedRoute path={BASE_ROUTES.ROOT} render={(props) => <AppGateway {...props}/>}/>
                    </Suspense>
                    </Container>
                </MainNavbar>

            </div>
        </Router>
    }
}

export default App;
