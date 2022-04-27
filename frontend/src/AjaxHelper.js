import Helper from "./helper";

let BASE = "http://127.0.0.1:8000/api/"

let API_ISSUE_RANDOM = "issue/random";
let API_ISSUE_RANDOM_LIME = "issue/random/lime";
let API_LOGIN = "auth/token/login";
let API_ME = "me/";

class AjaxHelperSingleton {

    _getAuthHeaderObj() {
        return {'Authorization': "Token " + localStorage.getItem("auth_token")}
    }

    _get(endpoint, params = {}) {
        return fetch(BASE + endpoint + Helper.concatParams(params),
            {
                method: "GET",
                headers:
                    {
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                        ...this._getAuthHeaderObj()
                    },
            })
            .then(resp => resp.json())
    }

    _post(endpoint, payload = {}) {
        return fetch(BASE + endpoint,
            {
                headers:
                    {
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                        ...this._getAuthHeaderObj()
                    },
                method: "POST",
                body: JSON.stringify(payload)
            })
            .then(resp => resp.json())
    }

    getRandomIssue()
    {
        return this._get(API_ISSUE_RANDOM)
    }

    getRandomIssueLime(bugType)
    {
        return this._get(API_ISSUE_RANDOM_LIME,{"bug_type": bugType})
    }

    login(email, password)
    {
        return this._post(API_LOGIN,{ username: email, password: password })
    }

    me() {
        return this._get(API_ME)
    }
}

const AjaxHelper = new AjaxHelperSingleton();
export default AjaxHelper;