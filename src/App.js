import React, { useState, useEffect, useRef } from "react";
import { Container } from "react-bootstrap";

import "./App.css";
import Loading from "./components/Loading";
import Header from "./components/Header";
import GameBoard from "./components/game/GameBoard";
import { GameState } from "./models/GameModel";

function App() {
  const [gameState, setGameState] = useState(GameState.CONNECTING);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedFields, setHighlightedFields] = useState([]);

  const URL = "ws://localhost:8888/ws";
  const PROTOCOL_NAME = "checkers_game";
  const socket = useRef(null);

  // Runs on start
  useEffect(() => {
    socket.current = new WebSocket(URL, PROTOCOL_NAME);
    socket.current.onopen = (e) => {
      setGameState(GameState.CONNECTED);
    };
    return () => {
      socket.current.close();
    };
  }, []);

  // On state change
  useEffect(() => {
    var playerUUID;
    switch (gameState) {
      case GameState.CONNECTED:
          playerUUID = localStorage.getItem("UUID");
          if (playerUUID === null) {
            socket.current.send("JoinNew");
          } else {
            socket.current.send(`JoinExisting;${playerUUID}`);
          }
        break;
    }
    console.log("New game state:", gameState);
  }, [gameState]);

  const piecePickUpDropCallback = (piece, pickedUpOrDropped) => {
    // pickedUpOrDropped: true menas picked up, false dropped down
    // TODO: Highlight possible moves
    if (pickedUpOrDropped) {
      setSelectedPiece(piece);
      setHighlightedFields([piece.fieldNo]);
    } else {
      setSelectedPiece(null);
      setHighlightedFields([]);
    }
  };

  const getMainElement = () => {
    switch (gameState) {
      case GameState.CONNECTING:
        return <Loading text="Connecting to server, please wait" />;
      case GameState.CONNECTED:
        return <Loading text="Joining a game room, please wait" />;
      case GameState.LOOKING_FOR_OPPONENT:
        return <Loading text="Looking for an opponent, please wait" />;
      default:
        return (
          <GameBoard
            piecePickUpDropCallback={piecePickUpDropCallback}
            pieces={[]}
            highlightedFields={highlightedFields}
          />
        );
    }
  };

  // Receiving messages
  useEffect(() => {
    socket.current.onmessage = (e) => {
      console.log("Server said: ", e.data);
      const tmp = e.data.split(';');
      switch(tmp[0]) {
        case 'Welcome':
            setGameState(GameState.LOOKING_FOR_OPPONENT);
            break;
        case 'WelcomeNew':
          localStorage.setItem('UUID', tmp[1]);
          setGameState(GameState.LOOKING_FOR_OPPONENT);
          break;
        case 'StartGame':
          setGameState(GameState.GAME_START);
          break;
        }
    };
  });

  return (
    <div>
      <Header />
      <GameBoard
            piecePickUpDropCallback={piecePickUpDropCallback}
            pieces={[]}
            highlightedFields={highlightedFields}
          />
      <Container>{getMainElement()}</Container>
    </div>
  );
}

// TODO: Handle reconnections

export default App;
