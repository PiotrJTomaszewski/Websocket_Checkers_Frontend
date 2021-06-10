import React, { useRef, useEffect } from "react";
import { Navbar } from "react-bootstrap";

import lightPieceImg from "../assets/light_man.png";
import darkPieceImg from "../assets/dark_man.png";
import mixedPieceImg from "../assets/mixed_king.png";
import { GamePieceColor } from "../models/GamePieceModel";
import GameState from "../models/GameModel";

const Header = (props) => {
  const image = useRef(null);
  const gameStateText = useRef("");

  useEffect(() => {
    switch (props.myColor) {
      case GamePieceColor.LIGHT:
        image.current = lightPieceImg;
        break;
      case GamePieceColor.DARK:
        image.current = darkPieceImg;
        break;
      default:
        image.current = mixedPieceImg;
        break;
    }
  }, [props.myColor]);

  useEffect(() => {
    switch (props.gameState) {
      case GameState.NOT_STARTED:
        gameStateText.current = "";
        break;
      case GameState.DARK_TURN:
        if (props.myColor === GamePieceColor.DARK) {
          gameStateText.current = "Your turn";
        } else {
          gameStateText.current = "Opponent's turn";
        }
        break;
      case GameState.LIGHT_TURN:
        if (props.myColor === GamePieceColor.LIGHT) {
          gameStateText.current = "Your turn";
        } else {
          gameStateText.current = "Opponent's turn";
        }
        break;
      case GameState.DARK_WON:
        if (props.myColor === GamePieceColor.DARK) {
          gameStateText.current = "You've won";
        } else {
          gameStateText.current = "You've lost";
        }
        break;
      case GameState.LIGHT_WON:
        if (props.myColor === GamePieceColor.LIGHT) {
          gameStateText.current = "You've won";
        } else {
          gameStateText.current = "You've lost";
        }
        break;
      case GameState.TIE:
        gameStateText.current = "A tie";
        break;
      default:
        gameStateText.current = "";
        break;
    }
  }, [props.gameState, props.myColor]);

  return (
    <Navbar bg="dark" variant="dark" className="navbar">
      <Navbar.Brand href="#">
        <img className="logo" src={mixedPieceImg} alt={"Logo"} /> Checkers
      </Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          {gameStateText.current}
          <img
            className="player_piece_img"
            src={image.current}
            alt={props.myColor === GamePieceColor.DARK ? "dark" : "light"}
          />
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
