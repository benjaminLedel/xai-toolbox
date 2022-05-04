import React from "react";
import {Row} from "react-bootstrap";
import { useSelector } from 'react-redux'
import XAILoading from "../xAILoading";

export default function Home() {

  const user = useSelector((state) => state.user)

  if(user == null)
      return  <div className={"mt-2 text-center"}>
          <XAILoading/>
      <h1>Welcome to xAI Toolbox</h1>
          </div>

  return (
    <div className={"mt-2"}>
      <h2>Dashboard from {user?.email}</h2>

        <Row>
            <div className="card text-white bg-primary mb-3">
                <div className="card-header">Issues</div>
                <div className="card-body">
                    <h5 className="card-title">Primary card title</h5>
                    <p className="card-text">Number of issues that are currently in the database</p>
                </div>
            </div>

             <div className="card text-white bg-primary mb-3">
                <div className="card-header">Header</div>
                <div className="card-body">
                    <h5 className="card-title">Primary card title</h5>
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of
                        the card's content.</p>
                </div>
            </div>
        </Row>
    </div>
  );
}