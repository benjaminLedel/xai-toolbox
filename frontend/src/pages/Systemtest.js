import {Col, Row} from "react-bootstrap";
import IssueViewer from "../components/IssueViewer";
import React, {useState, useEffect} from 'react';
import AjaxHelper from "../AjaxHelper";
import IssueLabelViewer from "../components/IssueLabelViewer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSync} from '@fortawesome/free-solid-svg-icons'
import BugNoBugSelect from "../components/BugNoBugSelect";

export default function Systemtest() {

    const [issueWithLabel, setIssueWithLabel] = useState(null);
    const [issue, setIssue] = useState(null);
    const [bugType, setBugType] = useState("bug");

    useEffect(() => {
        loadIssue()
        loadLimeData()
    }, [])

    const loadLimeData = () => {
        setIssueWithLabel(null)
        AjaxHelper.getRandomIssueLime(bugType).then(function (response) {
            setIssueWithLabel(response);
        });
    }

    const loadIssue = () => {
        setIssue(null)
        AjaxHelper.getRandomIssue().then(function (response) {
            setIssue(response);
        });

    }

    useEffect(() => {
        loadLimeData()
    }, [bugType])

    return (
        <div>
            <Row>
                <h2>Lime Visualisation</h2>
                <Row>
                    <Col>
                        <BugNoBugSelect value={bugType} setValue={e => setBugType(e.value)}/>
                    </Col>
                    <Col>
                        <button onClick={loadLimeData} className={"btn btn-primary"}><FontAwesomeIcon
                            icon={faSync}/> Load new issue
                        </button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {issueWithLabel ? <IssueLabelViewer predict_proba={issueWithLabel.predict_proba}
                                                            classes={issueWithLabel.class_names}
                                                            issue={issueWithLabel.sample}
                                                            lime={issueWithLabel.lime}/> : "Lade Daten.."}
                    </Col>
                </Row>
            </Row>

            <Row>
                <h2>Random Issue</h2>
                <Col>
                    <button onClick={loadIssue} className={"btn btn-primary"}><FontAwesomeIcon icon={faSync}/> Load new
                        issue
                    </button>
                    {issue ? <IssueViewer issue={issue}/> : "Lade Daten.."}
                </Col>
            </Row>
        </div>
    );
}