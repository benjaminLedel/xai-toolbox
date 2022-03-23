const EventTypes =
    {
        LOGOUT: "LOGOUT",
        LOGIN: "LOGIN"
    }

let loggedInState = true

export function isUserLoggedIn() {
    return loggedInState
}

function setLoggedIn(flag) {
    loggedInState = flag
}

class xAIEventManager {

    constructor() {

        this.logoutEventHandler = []
        this.loginEventHandler = []

    }

    _getHandlerList(type) {
        switch (type) {
            case EventTypes.LOGIN       :
                return this.loginEventHandler;
            case EventTypes.LOGOUT      :
                return this.logoutEventHandler;
            default:
                return null
        }
    }

    _registerHandler(registrationId, callback, type) {
        let handlerList = this._getHandlerList(type)
        for (let i = 0; i < handlerList; i++)
            if (handlerList[i].registrationId === registrationId)
                return handlerList[i].callback = callback
        handlerList.push({registrationId: registrationId, callback: callback})
    }

    _unregisterHandler(registrationId, type) {
        let handlerList = this._getHandlerList(type)
        for (let i = 0; i < handlerList.length; i++)
            if (handlerList[i].registrationId === registrationId)
                handlerList.splice(i, 1)
    }

    _fireEvent(type) {
        let handlerList = this._getHandlerList(type)
        handlerList.forEach(handler => handler.callback())
    }

    //// Login
    fireLoginEvent() {
        setLoggedIn(true)
        this._fireEvent(EventTypes.LOGIN)
    }

    registerLoginEventHandler(registrationId, callback) {
        this._registerHandler(registrationId, callback, EventTypes.LOGIN)
    }

    unregisterLoginEventHandler(registrationId) {
        this._unregisterHandler(registrationId, EventTypes.LOGIN)
    }

    //// Logout
    fireLogoutEvent() {
        setLoggedIn(false)
        this._fireEvent(EventTypes.LOGOUT)
    }

    registerLogoutEventHandler(registrationId, callback) {
        this._registerHandler(registrationId, callback, EventTypes.LOGOUT)
    }

    unregisterLogoutEventHandler(registrationId) {
        this._unregisterHandler(registrationId, EventTypes.LOGOUT)
    }

}

let EventManager = new xAIEventManager()

export default EventManager
