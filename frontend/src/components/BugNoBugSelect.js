import React, {useState} from "react";
import Select from "react-select";

export default function BugNoBugSelect(props) {


    const options = [
        {value: 'no_bug', label: 'No Bug'},
        {value: 'bug', label: 'Bug'},
    ]

    return <Select options={options} onChange={props.setValue} value={options.find((o) => o.value === props.value)}/>
}