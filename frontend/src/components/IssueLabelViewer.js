import React from "react";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build";
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {Col, Container, Row} from "react-bootstrap";
import "./marker.css";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function IssueLabelViewer(props) {
    var text = props.issue?.description?.replace(/(?:\r\n|\r|\n)/g, '<br>');
    const withLabel = props.withLabel ? props.withLabel : true;
    const withBarChart = props.withBarChart ? props.withBarChart : true;
    const editable = props.editable ? props.editable : false;

    const labels = props.lime?.map((word) => word[0]);
    const data = {
        labels,
        datasets: [
            {
                label: props.classes[0],
                data: props.lime?.map((word) => word[1] < 0 ? word[1] : 0),
                backgroundColor: 'rgb(185,22,56)',
            },
            {
                label: props.classes[1],
                data: props.lime?.map((word) => word[1] > 0 ? word[1] : 0),
                backgroundColor: 'rgb(34,87,201)',
            }
        ],
    };

    const options = {
        indexAxis: 'y',
        elements: {
            bar: {
                borderWidth: 2,
            },
        },
        responsive: true,
    };

    const classIndex = props.predict_proba.indexOf(Math.max(...props.predict_proba));

    // replace in the data
    props.lime?.forEach(function (word) {
        const cssClass = word[1] < 0 ? 'marker-green' : 'marker-yellow';
        text = text.replace(new RegExp("(?:^|\\W)" + word[0] + "(?:$|\\W)","gm"), ' <mark class="' + cssClass + '">' + word[0] + '</mark> ')
    })

    console.log(text)

    return <Container className={"mt-4 mb-4"}>
        <Row>
            <Col xs={6}>
                {
                    withBarChart ? <Bar options={options} data={data}/> : <></>
                }
            </Col>
            <Col xs={6}>
                    {withLabel ? <p>Predicted as: <b
                    style={{color: classIndex === 0 ? 'rgb(185,22,56)' : 'rgb(34,87,201)'}}>{props.classes[classIndex]}</b> <br></br>
                    Score: <b>{ Math.max(...props.predict_proba) }</b>
                </p> : <></>}
            </Col>
            <Col className={"mt-2"} xs={12}>
                <CKEditor
                    editor={Editor}
                    config={{
                        toolbar: editable ? ['highlight:yellowMarker', 'highlight:greenMarker', 'removeHighlight',] : [],
                        restrictedEditing: {
                            allowedCommands: editable ? ['highlight', 'highlight:yellowMarker', 'highlight:greenMarker','removeHighlight'] : [],
                        },
                        highlight: {
                            options: [
                                {
                                    model: 'greenMarker',
                                    class: 'marker-green',
                                    title: 'no bug',
                                    color: 'rgb(185,22,56)',
                                    type: 'marker'
                                },
                                {
                                    model: 'yellowMarker',
                                    class: 'marker-yellow',
                                    title: 'bug',
                                    color: 'rgb(34,87,201)',
                                    type: 'marker'
                                },
                            ]
                        },
                    }}
                    data={text}
                    onReady={(editor) => {
                        editor.plugins.get('RestrictedEditingModeEditing').enableCommand('highlight');
                        editor.model.document.selection.on('change:range', (eventInfo, directChange) => {
                            editor.execute('highlight', {value: 'yellowMarker'});
                        });
                    }}
                />
            </Col>
        </Row>
    </Container>
}