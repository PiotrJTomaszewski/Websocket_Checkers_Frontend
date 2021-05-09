import React, { useState } from "react";
import { Navbar } from 'react-bootstrap';

const Header = (props) => {
  return (
    <Navbar bg="dark" variant="dark">
    <Navbar.Brand href="#home">
      Checkers
    </Navbar.Brand>
  </Navbar>

  );
};

export default Header;
