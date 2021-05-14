import React, { useState } from "react";
import { Navbar } from "react-bootstrap";

import lightPieceImg from "../assets/light_man.png";
import darkPieceImg from "../assets/dark_man.png";
import { GamePieceColor } from "../models/GamePieceModel";
import GameState from "../models/GameState";

const Header = (props) => {
  var image;
  var gameStateText;
  switch (props.myColor) {
    case GamePieceColor.LIGHT:
      image = lightPieceImg;
      break;
    case GamePieceColor.DARK:
      image = darkPieceImg;
      break;
    default:
      image = "";
      break;
  }

  switch (props.gameState) {
    case GameState.DARK_TURN:
      if (props.myColor === GamePieceColor.DARK) {
        gameStateText = "Your turn";
      } else {
        gameStateText = "Opponent's turn";
      }
      break;
    case GameState.LIGHT_TURN:
      if (props.myColor === GamePieceColor.LIGHT) {
        gameStateText = "Your turn";
      } else {
        gameStateText = "Opponent's turn";
      }
      break;
    case GameState.DARK_WON:
      if (props.myColor === GamePieceColor.DARK) {
        gameStateText = "You've won";
      } else {
        gameStateText = "You've lost";
      }
      break;
    case GameState.LIGHT_WON:
      if (props.myColor === GamePieceColor.LIGHT) {
        gameStateText = "You've won";
      } else {
        gameStateText = "You've lost";
      }
      break;
    case GameState.TIE:
      gameStateText = "A tie";
      break;
    default:
      gameStateText = "";
      break;
  }

  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand href="#home">Checkers</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          {gameStateText}
          <img className="player_piece_img" src={image} />
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
