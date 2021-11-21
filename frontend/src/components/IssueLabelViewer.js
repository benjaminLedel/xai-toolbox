import React from "react";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build";

export default function IssueLabelViewer(props)
{
    return  <div>
         <CKEditor
                    editor={ Editor }
                    config={ {
                            toolbar: [ 'highlight:yellowMarker', 'highlight:greenMarker', 'highlight:pinkMarker',
                'highlight:greenPen', 'highlight:redPen', 'removeHighlight', ],
                        restrictedEditing: {
            allowedCommands: [ 'highlight','highlight:yellowMarker' ]
        }
                        } }
                    data={props.issue ? props.issue.description?.replace(/(?:\r\n|\r|\n)/g, '<br>') : ""}
                    onFocus={ ( event, editor ) => {
                        console.log( 'Focus.', editor );
                    } }
                    onReady={ (editor) => {
                        console.log(editor)
                        editor.plugins.get( 'RestrictedEditingModeEditing' ).enableCommand( 'highlight' );
                        editor.model.document.selection.on( 'change:range', (eventInfo,directChange) => {
                            editor.execute( 'highlight', { value: 'yellowMarker' } );
                        } );
                    }}
                />
    </div>
}