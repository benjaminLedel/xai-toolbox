import React, {Component} from 'react';
import {connect} from "react-redux";
import {
    GENERAL_SET_CURRENT_USER
} from "./redux/store";
import ProtectedRoute from "./ProtectedRoute";
import {BASE_ROUTES} from "./App";
import {Switch} from "react-router";
import EventManager from "./EventManager";
import AjaxHelper from "./AjaxHelper";
import Helper from "./helper";
import Train from "./pages/Train";
import XAILoading from "./xAILoading";

class AppGatewayReact extends Component {

    constructor(props) {
        super(props);

        this.state =
            {
                isComponentReady: false,
            }
    }

    componentDidMount() {
        // Listen to a global logout event, to redirect to the loginpage
        EventManager.registerLogoutEventHandler("EducaGateway", () => this.logoutEventHandler())
        EventManager.registerLoginEventHandler("EducaGateway", () => this.loginEventHandler())
        this.initApp()
    }

    componentWillUnmount() {
        EventManager.unregisterLogoutEventHandler("EducaGateway")
        EventManager.unregisterLoginEventHandler("EducaGateway")
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    /**
     * When a login is fired
     * This is only called, whenever this component was mounted BEFORE a user logs out and logs in again
     */
    loginEventHandler() {
        this.initApp()
    }

    /**
     * Init the app and update the redux store with all recent data
     *
     */
    initApp() {
        AjaxHelper.me() // get the current clouduser
            .then(resp => {
                if (resp.payload && resp.payload.user) {
                    this.props.updateCurrentUser(resp.payload.user)
                } else
                    throw new Error("Server Error")
                return AjaxHelper.me()
            }).catch(err => {
                Helper.fireErrorToast("Fehler", "Kritischer Server Fehler." + err.message)
            })
         .finally(() => {
                                this.setState({isComponentReady: true})
                            })

    }

    routing() {
        return <Switch>
                <ProtectedRoute path={BASE_ROUTES.TOOLS_TRAINING} render={(props) => <Train {...props}/>} />
            </Switch>
    }


    render() {
        return <div>
            {this.state.isComponentReady ?
                this.routing() :
                <XAILoading/>}</div>
            ;
    }
}

const mapStateToProps = state => ({store: state})

const mapDispatchToProps = dispatch => {
    return {
        // dispatching plain actions
        updateCurrentUser: (currentUser) => dispatch({type: GENERAL_SET_CURRENT_USER, payload: currentUser}),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppGatewayReact);
