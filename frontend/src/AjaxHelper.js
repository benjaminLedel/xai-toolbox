import Helper from "./helper";
import EventManager from "./EventManager";

let BASE = "http://127.0.0.1:8000/api/"

let API_ISSUE_RANDOM = "issue/random";
let API_ISSUE_RANDOM_SET = "issue/randomSet";
let API_ISSUE_RANDOM_LIME = "issue/random/lime";
let API_ISSUE_RANDOM_SHAP = "issue/random/shap";
let API_LOGIN = "token/";
let API_ME = "me/";

class AjaxHelperSingleton {

    _getAuthHeaderObj() {
        return {'Authorization': "Bearer " + localStorage.getItem("auth_token")}
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

    getRandomIssueSet()
    {
        return this._get(API_ISSUE_RANDOM_SET)
    }


    getRandomIssueLime(bugType)
    {
        return this._get(API_ISSUE_RANDOM_LIME,{"bug_type": bugType})
    }

    getRandomIssueShap(bugType)
    {
        return this._get(API_ISSUE_RANDOM_SHAP,{"bug_type": bugType})
    }

    login(email, password)
    {
        return fetch(BASE + API_LOGIN,
            {
                headers:
                    {
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                    },
                method: "POST",
                body: JSON.stringify({ username: email, password: password })
            })
            .then(resp => resp.json());
    }

     logout() {
    }

    me() {
        return this._get(API_ME)
    }
}

const AjaxHelper = new AjaxHelperSingleton();
export default AjaxHelper;