import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { useSelector } from 'react-redux'
import XAILoading from "../xAILoading";
import AjaxHelper from "../AjaxHelper";

export default function Home() {

    const user = useSelector((state) => state.user)
    const [progress, setProgress] = useState({});
    useEffect(async () => {
        const progress = await AjaxHelper.getRatingProgress().then((result) => { return result });
        setProgress(progress);
    }, [])


    if (user == null)
        return <div className={"mt-2 text-center"}>
            <XAILoading />
            <h1>Welcome to xAI Toolbox</h1>
        </div>

    return (
        <div className={"mt-2"}>
            <h2>Dashboard from {user?.email}</h2>

            <Row>
                <div className="card text-white bg-primary mb-3">
                    <div className="card-header">Rating progress</div>
                    <div className="card-body">
                        <p className="card-text">
                            {progress ? Object.keys(progress).map((key) => {
                                return (<div>{key}: {progress[key]}</div>)
                            }) : 'loading progress'}
                        </p>
                    </div>
                </div>
            </Row>
        </div>
    );
}