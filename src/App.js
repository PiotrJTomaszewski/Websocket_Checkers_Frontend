import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";

import "./App.css";
import Loading from "./components/Loading";
import Header from "./components/Header";

function App() {
  const [mainElement, setMainElement] = useState(
    <Loading text="Connecting to server, please wait" />
  );
  return (
    <div>
      <Header />
      <Container>{mainElement}</Container>
    </div>
  );
}

export default App;
