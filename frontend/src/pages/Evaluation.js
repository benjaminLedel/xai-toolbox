import React, {useEffect, useState} from "react";
import {Col, Row, Table, Form, Card, Alert} from "react-bootstrap";
import IssueLabelViewer from "../components/IssueLabelViewer";
import AjaxHelper from "../AjaxHelper";

export default function Evaluation() {

    const [issueWithLabel, setIssueWithLabel] = useState(null);
    const [issueWithLabel2, setIssueWithLabel2] = useState(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        loadLimeData()
    }, [])

    const loadLimeData = () => {
        setIssueWithLabel(null)
        setIssueWithLabel2(null)
        AjaxHelper.getRandomIssueSet().then(function (response) {
            if(!response.error) {
                setError(false)
                setIssueWithLabel(response.issue1);
                setIssueWithLabel2(response.issue2);
            } else {
                setError(true)
            }
        });
    }

    const saveData = () => {

    }

    const skipIssueClick = () => {
      loadLimeData()
    }

    let issueView = (id) => {
        if(id === "left") {
            return issueWithLabel ? <IssueLabelViewer predict_proba={issueWithLabel.predict_proba}
                                                         classes={issueWithLabel.class_names}
                                                         text={issueWithLabel.sample}
                                                      withLabel={false}
                                                       clueMode={issueWithLabel.clueMode}
                                                         xai_toolkit_response={issueWithLabel.xai_toolkit_response}/> : <>Lade
                Daten..</>
        }

        if(id === "right") {
            return issueWithLabel2 ? <IssueLabelViewer predict_proba={issueWithLabel2.predict_proba}
                                                         classes={issueWithLabel2.class_names}
                                                         text={issueWithLabel2.sample}
                                                      withLabel={false}
                                                       clueMode={issueWithLabel2.clueMode}
                                                         xai_toolkit_response={issueWithLabel2.xai_toolkit_response}/> : <>Lade
                Daten..</>
        }
    }

    let table = (id) => {
        return <Table striped bordered hover>
            <thead>
            <tr>
                <th>Category</th>
                <th>-1</th>
                <th>0</th>
                <th>+1</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>Related</td>
                <td><Form.Check inline name={"related" + id} type={"radio"}/></td>
                <td><Form.Check inline name={"related" + id} type={"radio"}/></td>
                <td><Form.Check inline name={"related" + id} type={"radio"}/></td>
            </tr>
            <tr>
                <td>Unambigiuous</td>
                <td><Form.Check inline name={"unambigiuous" + id} type={"radio"}/></td>
                <td><Form.Check inline name={"unambigiuous" + id} type={"radio"}/></td>
                <td><Form.Check inline name={"unambigiuous" + id} type={"radio"}/></td>
            </tr>
            <tr>
                <td>Contextual</td>
                <td><Form.Check inline name={"contextual" + id} type={"radio"}/></td>
                <td><Form.Check inline name={"contextual" + id} type={"radio"}/></td>
                <td><Form.Check inline name={"contextual" + id} type={"radio"}/></td>
            </tr>
            <tr>
                <td>Insightful</td>
                <td><Form.Check inline name={"insightful" + id} type={"radio"}/></td>
                <td><Form.Check inline name={"insightful" + id} type={"radio"}/></td>
                <td><Form.Check inline name={"insightful" + id} type={"radio"}/></td>
            </tr>
            </tbody>
        </Table>
    }

    return (
        <div className={"mt-2"}>
            {!ready ?
                <Card className={"text-center"}>
                    <Card.Body>
                        <h2>Start labeling</h2>
                        <p className={"text-start"}>
                            <b>Disclaimer:</b> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                            eirmod
                            tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
                            accusam
                            et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
                            Lorem
                            ipsum
                            dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
                            eirmod
                            tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
                            accusam
                            et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
                            Lorem
                            ipsum
                            dolor sit amet.

                        </p>

                        <button className={"btn btn-primary"} onClick={() => setReady(true)}>I understand the definition and start labeling</button>
                    </Card.Body>
                </Card> :
                    error ? <>
                        <Alert variant={"danger"}>This was an error. Check, if the data is prepared and already in the database for both tools.</Alert>
                        </> :

                <div className={"mt-2"}>
                    <Row>
                        <Col>
                            {issueView("left")}
                            {table("left")}
                        </Col>
                        <Col>
                            {issueView("right")}
                            {table("right")}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <button className={"btn btn-secondary m-1"} onClick={skipIssueClick}>Skip issue</button>
                            <button className={"btn btn-success m-1"} onClick={saveData}>Submit data</button>
                        </Col>
                    </Row>
                </div>
            }
        </div>
    );
}