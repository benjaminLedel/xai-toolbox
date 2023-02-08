import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title,
    Tooltip
} from 'chart.js';
import Editor from "ckeditor5-custom-build";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Bar } from 'react-chartjs-2';
import { v4 as uuidv4 } from 'uuid';
import "./marker.css";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function getHTMLWrapper(word, rating, factor) {
    if (word === "") {
        return word
    }
    const cssClass = rating < 0 ? 'marker-yellow' : 'marker-green';
    const visiblity = Math.abs(factor * rating) !== Infinity ? Math.abs(factor * rating) : 0.0001;
    var color = "#fff";
    if (visiblity < 0.15) {
        color = "#000";
    }
    word = word.replace(/[&<>]/g, replaceHTMLTags);
    return '<div class="marker-view" style="color: ' + color + '; background-color: ' + (cssClass !== "marker-yellow" ? "rgb(185,22,56," + visiblity + ")" : "rgb(34,87,201," + visiblity + ")") + '; display: inline; margin: 2px;">' + word + '</div>'
}

function replaceHTMLTags(tag) {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };

    return tagsToReplace[tag] || tag;
}

export default function IssueLabelViewer(props) {
    var text = props.text?.replace(/(?:\r\n|\r|\n)/g, ' ').replace(/[&<>]/g, replaceHTMLTags);
    const withLabel = props.withLabel === null ? true : props.withLabel;
    /** clueMode is true if all the text elements are available. it is false if only the 10 most importent ones are */
    const clueMode = props.clueMode === null ? false : props.clueMode;
    const withBarChart = props.withBarChart ? props.withBarChart : true;
    const editable = props.editable ? props.editable : false;

    const sortedResponses = [...props.xai_toolkit_response].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 10)
    const labels = sortedResponses.map((word) => word[0]);
    const data = {
        labels,
        datasets: [
            {
                label: props.classes[0],
                data: sortedResponses.map((word) => word[1] < 0 ? word[1] : 0),
                backgroundColor: 'rgb(34,87,201)',
            },
            {
                label: props.classes[1],
                data: sortedResponses.map((word) => word[1] > 0 ? word[1] : 0),
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

    const max = Math.max(...props.xai_toolkit_response.map(([_, rating]) => Math.abs(rating)));
    const factor = 1 / max;

    if (clueMode) {
        /** (SHAP) we have access to all the words in the issue in the response list itself. so we only need to append them */
        text = props.xai_toolkit_response.map(([word, rating]) => {
            console.log(word)
            if (labels.includes(word)) {
                return getHTMLWrapper(word, rating, factor)
            }
            else {
                return word.replace(/[&<>]/g, replaceHTMLTags)
            }
        }).join(" ")
    } else {
        /**
         * (LIME) 
         * map the important words to ids, then replace them by the ids. this ensures that words like 'class',
         * which appear in the inserted html and the text corpus itself, are handled correctly. (overwritten or not).
         */
        var responseMapping = {}
        props.xai_toolkit_response.forEach(([word, rating]) => {
            const key = uuidv4();
            responseMapping[key] = [word, rating];
            const escapedWord = word.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
            const regexStr = "(?:^|\\W)" + escapedWord + "(?:$|\\W)";
            text = text.replaceAll(new RegExp(regexStr, "gm"), " " + key + " ");
        })

        Object.keys(responseMapping).forEach(key => {
            const html = getHTMLWrapper(responseMapping[key][0], responseMapping[key][1], factor)
            text = text.replaceAll(key, html)
        })
    }
    text = '<div class="inline-text"> ' + text + ' </div>';

    return <Container className={"mt-4 mb-4"}>
        <Row>
            <Col xs={withLabel === true ? 6 : 12}>
                {
                    withBarChart ? <Bar options={options} data={data} /> : <></>
                }
            </Col>
            <Col xs={6}>
                {withLabel === true ? <p>Predicted as: <b
                    style={{ color: classIndex === 0 ? 'rgb(34,87,201)' : 'rgb(185,22,56)' }}>{props.classes[classIndex]}</b>
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
                        if (props.editable) {
                            editor.plugins.get('RestrictedEditingModeEditing').enableCommand('highlight');

                            editor.model.document.selection.on('change:range', (eventInfo, directChange) => {
                                editor.execute('highlight', { value: 'yellowMarker' });
                            });
                        }
                    }}
                />
            </Col>
        </Row>
    </Container>
}