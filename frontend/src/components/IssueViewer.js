import React from "react";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build";
import "./marker.css";

export default function IssueViewer(props) {
    var data = props.issue ? props.issue.description?.replace(/(?:\r\n|\r|\n)/g, '<br>') : "";

    const saveData = () => {
        console.log(data)
    }

    return <div className={"mt-4 mb-4"}>
        <CKEditor
            editor={Editor}
            config={{
                toolbar: ['highlight:yellowMarker', 'highlight:greenMarker', 'removeHighlight',],
                restrictedEditing: {
                    allowedCommands: ['highlight', 'highlight:yellowMarker', 'highlight:greenMarker','removeHighlight']
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
            data={data}
            onFocus={(event, editor) => {
                console.log('Focus.', editor);
            }}
            onChange={(event, editor) => {
                data = editor.getData();
            }}
            onReady={(editor) => {
                console.log(editor)
                editor.plugins.get('RestrictedEditingModeEditing').enableCommand('highlight');
                editor.model.document.selection.on('change:range', (eventInfo, directChange) => {
                    editor.execute('highlight', {value: 'yellowMarker'});
                });
            }}
        />
        <button onClick={saveData} className={"btn btn-success"}>Weiter</button>
    </div>
}