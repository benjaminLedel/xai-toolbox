import Helper from "./helper";

let BASE = "http://127.0.0.1:8000/api"

let API_ISSUE_RANDOM = "issue/random";
let API_ISSUE_RANDOM_LIME = "issue/random/lime";

class AjaxHelperSingleton {

    _getAuthHeaderObj() {
        return {'Authorization': "Bearer "}
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

    getRandomIssueLime()
    {
        return this._get(API_ISSUE_RANDOM_LIME)
    }


}

const AjaxHelper = new AjaxHelperSingleton();
export default AjaxHelper;