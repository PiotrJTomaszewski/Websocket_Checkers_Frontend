import React, { useState, useEffect, useRef } from "react";
import { Container } from "react-bootstrap";

import "./App.css";
import Loading from "./components/Loading";
import Header from "./components/Header";
import GameBoard from "./components/game/GameBoard";
import { GameState } from "./models/GameModel";

function App() {
  const [mainElement, setMainElement] = useState(
    <Loading text="Connecting to server, please wait" />
  );
  const[gameState, setGameState] = useState(GameState.CONNECTING);
  const[selectedPiece, setSelectedPiece] = useState(null);
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
    }
  }, []);

  // On game state change
  useEffect(() => {
    switch(gameState) {
      case GameState.CONNECTING:
          setMainElement(<Loading text="Connecting to server, please wait" />);
          break;
      case GameState.CONNECTED:
          setMainElement(<Loading text="Joining a game room, please wait" />);
          break;
      case GameState.LOOKING_FOR_OPPONENT:
          setMainElement(<Loading text="Looking for an opponent, please wait" />);
          break;
      case GameState.GAME_START:
          setMainElement(<GameBoard />)
          break;
    }
    
  }, [gameState]);

  // Receiving messages
  useEffect(() => {
    socket.current.onmessage = (e) => {
      console.log("Server said: ", e.data);
    }
  })

  return (
    <div>
      <Header />
      <Container>{mainElement}</Container>
    </div>
  );
}

export default App;
