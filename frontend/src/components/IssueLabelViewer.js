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
    var text =  props.text?.replace(/(?:\r\n|\r|\n)/g, ' ').toLowerCase();
    const withLabel = props.withLabel === null ? true : props.withLabel;
    const clueMode = props.clueMode === null ? false : props.clueMode;
    const withBarChart = props.withBarChart ? props.withBarChart : true;
    const editable = props.editable ? props.editable : false;

    const labels = props.xai_toolkit_response?.slice(0,10).map((word) => word[0]);
    const data = {
        labels,
        datasets: [
            {
                label: props.classes[0],
                data: props.xai_toolkit_response?.slice(0,10).map((word) => word[1] < 0 ? word[1] : 0),
                backgroundColor: 'rgb(34,87,201)',
            },
            {
                label: props.classes[1],
                data: props.xai_toolkit_response?.slice(0,10).map((word) => word[1] > 0 ? word[1] : 0),
                backgroundColor: 'rgb(185,22,56)',
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

    const max = Math.max(...props.xai_toolkit_response.map(function(row){ return row[1] }));
    const faktor = 1 / max;

    if(clueMode)
    {
            console.log("clueMode: " + clueMode)
          text = props.xai_toolkit_response?.map(function (word) {
            const cssClass = word[1] < 0 ? 'marker-yellow' : 'marker-green';
            const visiblity = Math.abs(faktor * word[1]);
            var color = "#fff";
            if(visiblity < 0.15)
            {
                color = "#000";
            }
            return '<div class="marker-view" style="color: ' + color + '; background-color: ' + (cssClass !== "marker-yellow" ? "rgb(185,22,56," + visiblity + ")" : "rgb(34,87,201," + visiblity + ")") + '; display: inline; margin: 2px;">' + word[0] +
                '</div>'
        }).join(" ")
    } else {
            console.log("clueMode2: " + clueMode)
        // replace in the data
        props.xai_toolkit_response?.forEach(function (word) {
            if (word[0].trim().length <= 3)
                return;
            const cssClass = word[1] < 0 ? 'marker-yellow' : 'marker-green';
            const visiblity = Math.abs(faktor * word[1]);
            var color = "#fff";
            if(visiblity < 0.15)
            {
                color = "#000";
            }
            text = text.replace(new RegExp("(?:^|\\W)" + word[0] + "(?:$|\\W)", "gm"), ' ' +
                '</div><div class="marker-view" style="color: ' + color + '; background-color: ' + (cssClass !== "marker-yellow" ? "rgb(185,22,56," + visiblity + ")" : "rgb(34,87,201," + visiblity + ")") + '; display: inline; margin: 2px;">' + word[0] +
                '</div><div style="display: inline;"> ')
        })
        text = '<div style="display: inline;">' + text + '</div>';
        text = text.replace('<div style="display: inline;"> </div>','')
    }
    console.log(text)

    return <Container className={"mt-4 mb-4"}>
        <Row>
            <Col xs={withLabel === true ? 6 : 12 }>
                {
                    withBarChart ? <Bar options={options} data={data}/> : <></>
                }
            </Col>
            <Col xs={6}>
                {withLabel === true ? <p>Predicted as: <b
                    style={{color: classIndex === 0 ? 'rgb(34,87,201)' : 'rgb(185,22,56)'}}>{props.classes[classIndex]}</b>
                    <br></br>
                    Score: <b>{Math.max(...props.predict_proba)}</b>
                </p> : <></>}
            </Col>
            <Col className={"mt-2"} xs={12}>
                <CKEditor
                    editor={Editor}
                    config={{
                        toolbar: editable ? ['highlight:yellowMarker', 'highlight:greenMarker', 'removeHighlight',] : [],
                        restrictedEditing: {
                            allowedCommands: editable ? ['highlight', 'highlight:yellowMarker', 'highlight:greenMarker', 'removeHighlight'] : [],
                        },
                        doNotAutoparagraph: true,
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
                        htmlSupport: {
                            allow: [{
                                name: 'div',
                                styles: true,
                                classes: true
                            }]
                        }
                    }}
                    data={text}
                    onReady={(editor) => {
                        if(props.editable) {
                            editor.plugins.get('RestrictedEditingModeEditing').enableCommand('highlight');

                            editor.model.document.selection.on('change:range', (eventInfo, directChange) => {
                                editor.execute('highlight', {value: 'yellowMarker'});
                            });
                        }
                    }}
                />
            </Col>
        </Row>
    </Container>
}