import React from "react";
import { Spinner } from "react-bootstrap";

const Loading = (props) => {
  if (props.show) {
    return (
      <div className="text-center">
        <h1 className="display-1 mt-5">{props.text}</h1>
        <Spinner animation="border" />
      </div>
    );
  } else {
    return <div></div>
  }
};

export default Loading;
