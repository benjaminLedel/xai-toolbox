import React, {useState} from "react";
import "./login.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWind} from "@fortawesome/free-solid-svg-icons";
import {FormControl} from "react-bootstrap";
import AjaxHelper from "../AjaxHelper";
import EventManager from "../EventManager";
import { useDispatch } from 'react-redux'
import {GENERAL_SET_CURRENT_USER} from "../redux/store";
import {Redirect} from "react-router";
import {BASE_ROUTES} from "../App";

export default function Login() {

    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [error, setError] = useState(null);
    const [loginSuccessful, setLoginSuccessful] = useState(false);
    const dispatch = useDispatch()


    const login = () => {
        setError(null)
        AjaxHelper.login(email,password).then(function (response) {
            console.log(response)
            if(response.access)
            {
                localStorage.setItem("auth_token",response.access)
                dispatch({type: GENERAL_SET_CURRENT_USER, payload: {email: email}})
                EventManager.fireLoginEvent()
                setLoginSuccessful(true)
            } else {
                throw "E-Mail or Password is wrong";
            }
            //setIssueWithLabel(response);
        }).catch(function (error) {
            setError(error)
        });
    }

    if(loginSuccessful)
        return <Redirect to={BASE_ROUTES.ROOT}/>
  return (
      <main className="form-signin" style={{textAlign:"center"}}>
        <div>
            <FontAwesomeIcon className={"mb-4"} size="6x" icon={faWind} />
                <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
            { error ? <p className="text-danger">{error}</p> : <></> }
                <div className="form-floating">
                    <FormControl onKeyPress={(evt) => {
                                                if (evt.key === "Enter") login()
                                            }} type="email" className="form-control" id="floatingInput" placeholder="name@example.com" value={email} onChange={(event => setEmail(event.target.value))} />
                        <label htmlFor="floatingInput">Email address</label>
                </div>
                <div className="form-floating">
                    <FormControl onKeyPress={(evt) => {
                                                if (evt.key === "Enter") login()
                                            }} type="password" className="form-control" id="floatingPassword" placeholder="Password" value={password} onChange={(event => setPassword(event.target.value))} />
                        <label htmlFor="floatingPassword">Password</label>
                </div>
                <button  onClick={login} className="w-100 btn btn-lg btn-primary">Sign in</button>
                <p className="mt-5 mb-3 text-muted">&copy; 2022</p>
        </div>
    </main>
  );
}