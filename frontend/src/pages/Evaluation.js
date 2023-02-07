import React, { useEffect, useState } from "react";
import { Alert, Card, Form, Table } from "react-bootstrap";
import AjaxHelper from "../AjaxHelper";
import IssueLabelViewer from "../components/IssueLabelViewer";
import Helper from "../helper";
import "./evaluation.css";

export default function Evaluation() {

    const [issueId, setIssueId] = useState(null);
    const [issueWithLabel, setIssueWithLabel] = useState(null);
    const [issueWithLabel2, setIssueWithLabel2] = useState(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(false);
    const [responseObject, setResponseObject] = useState([]);
    const [left, setLeft] = useState("");
    const [right, setRight] = useState("");
    const [title, setTitle] = useState(null);

    useEffect(() => {
        loadLimeData()
    }, [])

    const loadLimeData = () => {
        setIssueWithLabel(null)
        setIssueWithLabel2(null)
        setResponseObject([]);
        AjaxHelper.getRandomIssueSet().then(function (response) {
            if (!response.error) {
                setError(false)
                setIssueWithLabel(response.issue1);
                setIssueWithLabel2(response.issue2);
                setLeft(response.left)
                setRight(response.right)
                setIssueId(response.issue_id)
                setTitle(null)
            } else {
                setError(true)
                setTitle(response.title)
            }
        });
    }

    const saveData = () => {
        console.log(responseObject)
        if (Object.keys(responseObject).length != 8) {
            Helper.fireWarningToast("Please check your input", "You need to decide for all categories and for both issues, if the category belongs to the explanation or not.")
        } else {
            AjaxHelper.saveRating(responseObject, issueId).then(function (response) {
                Helper.fireSuccessToast("Saved your input", "We saved your input data")
                loadLimeData()
            });
        }
    }

    const skipIssueClick = () => {
        loadLimeData()
    }

    let issueView = (id) => {
        if (id === "left") {
            return issueWithLabel ? <IssueLabelViewer predict_proba={issueWithLabel.predict_proba}
                classes={issueWithLabel.class_names}
                text={issueWithLabel.sample}
                withLabel={false}
                clueMode={issueWithLabel.clueMode}
                xai_toolkit_response={issueWithLabel.xai_toolkit_response} /> : <>Lade Daten..</>
        }

        if (id === "right") {
            return issueWithLabel2 ? <IssueLabelViewer predict_proba={issueWithLabel2.predict_proba}
                classes={issueWithLabel2.class_names}
                text={issueWithLabel2.sample}
                withLabel={false}
                clueMode={issueWithLabel2.clueMode}
                xai_toolkit_response={issueWithLabel2.xai_toolkit_response} /> : <>Lade Daten..</>
        }
    }

    let updateValue = (keyId, e) => {
        keyId = keyId.replace("left", left);
        keyId = keyId.replace("right", right);
        let cloneResponseObject = Object.assign({}, responseObject);
        cloneResponseObject[keyId] = e.target.value;
        setResponseObject(cloneResponseObject)
    }

    let valueGrapper = (keyId, value) => {
        keyId = keyId.replace("left", left);
        keyId = keyId.replace("right", right);
        return responseObject[keyId] == value
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
                    <td><Form.Check checked={valueGrapper("related-" + id, "-1")} value={"-1"} inline name={"related" + id} onChange={(e) => { updateValue("related-" + id, e) }} type={"radio"} /></td>
                    <td><Form.Check checked={valueGrapper("related-" + id, "0")} value={"0"} inline name={"related" + id} onChange={(e) => { updateValue("related-" + id, e) }} type={"radio"} /></td>
                    <td><Form.Check checked={valueGrapper("related-" + id, "1")} value={"1"} inline name={"related" + id} onChange={(e) => { updateValue("related-" + id, e) }} type={"radio"} /></td>
                </tr>
                <tr>
                    <td>Unambigiuous</td>
                    <td><Form.Check checked={valueGrapper("unambigiuous-" + id, "-1")} value={"-1"} inline name={"unambigiuous" + id} onChange={(e) => { updateValue("unambigiuous-" + id, e) }} type={"radio"} /></td>
                    <td><Form.Check checked={valueGrapper("unambigiuous-" + id, "0")} value={"0"} inline name={"unambigiuous" + id} onChange={(e) => { updateValue("unambigiuous-" + id, e) }} type={"radio"} /></td>
                    <td><Form.Check checked={valueGrapper("unambigiuous-" + id, "1")} value={"1"} inline name={"unambigiuous" + id} onChange={(e) => { updateValue("unambigiuous-" + id, e) }} type={"radio"} /></td>
                </tr>
                <tr>
                    <td>Contextual</td>
                    <td><Form.Check checked={valueGrapper("contextual-" + id, "-1")} value={"-1"} inline name={"contextual" + id} onChange={(e) => { updateValue("contextual-" + id, e) }} type={"radio"} /></td>
                    <td><Form.Check checked={valueGrapper("contextual-" + id, "0")} value={"0"} inline name={"contextual" + id} onChange={(e) => { updateValue("contextual-" + id, e) }} type={"radio"} /></td>
                    <td><Form.Check checked={valueGrapper("contextual-" + id, "1")} value={"1"} inline name={"contextual" + id} onChange={(e) => { updateValue("contextual-" + id, e) }} type={"radio"} /></td>
                </tr>
                <tr>
                    <td>Insightful</td>
                    <td><Form.Check checked={valueGrapper("insightful-" + id, "-1")} value={"-1"} inline name={"insightful" + id} onChange={(e) => { updateValue("insightful-" + id, e) }} type={"radio"} /></td>
                    <td><Form.Check checked={valueGrapper("insightful-" + id, "0")} value={"0"} inline name={"insightful" + id} onChange={(e) => { updateValue("insightful-" + id, e) }} type={"radio"} /></td>
                    <td><Form.Check checked={valueGrapper("insightful-" + id, "1")} value={"1"} inline name={"insightful" + id} onChange={(e) => { updateValue("insightful-" + id, e) }} type={"radio"} /></td>
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
                title ?
                    <>
                        <Alert variant={"warning"}>{title}</Alert>
                    </> :
                    error ? <>
                        <Alert variant={"danger"}>This was an error. Check, if the data is prepared and already in the database for both tools.</Alert>
                    </> :


                        <div className="evaluation-body">
                            <div className="issue-row">
                                <div className="row-item">
                                    {issueView("left")}
                                </div>
                                <div className="row-item">
                                    {issueView("right")}
                                </div>
                            </div>
                            <div className="issue-row">
                                <div className="row-item">
                                    {table("left")}
                                </div>
                                <div className="row-item">
                                    {table("right")}
                                </div>
                            </div>
                            <button className={"btn btn-secondary m-1"} onClick={skipIssueClick}>Skip issue</button>
                            <button className={"btn btn-success m-1"} onClick={saveData}>Submit data</button>
                        </div>
            }
        </div>
    );
}