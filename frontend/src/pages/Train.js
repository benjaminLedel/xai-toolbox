import React, {useEffect, useState} from "react";
import {Alert, Col, Container, Row} from "react-bootstrap";
import AjaxHelper from "../AjaxHelper";
import IssueLabelViewer from "../components/IssueLabelViewer";
import IssueViewer from "../components/IssueViewer";
import BugNoBugSelect from "../components/BugNoBugSelect";

export default function Train() {

    const [issue, setIssue] = useState(null);
    const [bugType, setBugType] = useState(null);

     useEffect(() => {
        loadIssue()
    }, [])

     const loadIssue = () => {
        setIssue(null)
        AjaxHelper.getRandomIssue().then(function (response) {
            setIssue(response);
        });

    }

    return (
        <div className={"mt-4"}>
            <Alert variant="dark">
                <Alert.Heading>xAI Training</Alert.Heading>
                <p>
                    We randomly load an issue from the database. Please read the issue and highlight the words that indicate a bug. Finally, decide if the bug should be labeled as bug or no bug.
                </p>
            </Alert>
             {issue ? <Container>
            <Row>
                <Col>
                    <BugNoBugSelect value={bugType} setValue={e => setBugType(e.value)}/>
                </Col>
            </Row>
            <Row>
                 <Col>
                    <IssueViewer issue={issue}/>
                 </Col>
            </Row></Container>
                 : "Lade Daten.."}
        </div>
    );
}