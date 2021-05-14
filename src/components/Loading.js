import React from "react";
import { Spinner } from "react-bootstrap";

const Loading = (props) => {
  return (
    <div className="text-center">
      <h1 className="display-1 mt-5">{props.text}</h1>
      <Spinner animation="border" />
    </div>
  );
};

export default Loading;
