import {Col, Row} from "react-bootstrap";
import IssueViewer from "../components/IssueViewer";
import React, { useState, useEffect } from 'react';
import AjaxHelper from "../AjaxHelper";

export default function Systemtest() {

    const [issueWithLabel, setIssueWithLabel] = useState(null);
    const [issue, setIssue] = useState(null);

    useEffect(() => {
        AjaxHelper.getRandomIssue().then(function (response) {
            setIssue(response);
        });

         AjaxHelper.getRandomIssueLime().then(function (response) {
            setIssueWithLabel(response);
        });

    },[])

    return (
        <div>
            <Row>
                <Col>
                    {issue ? <IssueViewer issue={issue} /> : "Lade Daten.."}
                </Col>
            </Row>
            <Row>
                <Col>
                    {issueWithLabel ? <IssueViewer issue={issueWithLabel} /> : "Lade Daten.."}
                </Col>
            </Row>
        </div>
    );
}