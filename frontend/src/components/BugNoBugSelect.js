import React, {useState} from "react";
import Select from "react-select";

export default function BugNoBugSelect(props) {


    const options = [
        {value: null, label: 'Please select'},
        {value: 'no_bug', label: 'no bug'},
        {value: 'bug', label: 'bug'},
    ]

    return <Select options={options} onChange={props.setValue} value={options.find((o) => o.value === props.value)}/>
}