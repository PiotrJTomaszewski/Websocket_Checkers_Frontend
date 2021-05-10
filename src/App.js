import React, { useState, useEffect, useRef } from "react";
import { Container } from "react-bootstrap";

import "./App.css";
import Loading from "./components/Loading";
import Header from "./components/Header";
import GameBoard from "./components/game/GameBoard";
import { GameState } from "./models/GameModel";
import GamePieceModel from "./models/GamePieceModel";

const ConnectionState = {
  CONNECTING: 0,
  CONNECTED: 1,
  LOOKING_FOR_OPPONENT: 2,
  IN_GAME: 3
}


function App() {
  const [connectionState, setConnectionState] = useState(ConnectionState.CONNECTING);
  const [gameState, setGameState] = useState(GameState.NOT_STARTED);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [gamePieces, setGamePieces] = useState([]);
  const [myColor, setMyColor] = useState(null);

  const URL = "ws://localhost:8888/ws";
  const PROTOCOL_NAME = "checkers_game";
  const socket = useRef(null);

  // Runs on start
  useEffect(() => {
    socket.current = new WebSocket(URL, PROTOCOL_NAME);
    socket.current.onopen = (e) => {
      console.log("Socket open");
      setConnectionState(ConnectionState.CONNECTED);
    };
    return () => {
      console.log("Socket close");
      socket.current.close();
    };
  }, []);

  // On connection state change
  useEffect(() => {
    var playerUUID;
    switch (connectionState) {
      case ConnectionState.CONNECTED:
          playerUUID = localStorage.getItem("UUID");
          if (playerUUID === null) {
            console.log("Sent:", "JoinNew");
            socket.current.send("JoinNew");
          } else {
            console.log("Sent:", `JoinExisting;${playerUUID}`);
            socket.current.send(`JoinExisting;${playerUUID}`);
          }
        break;
    }
    console.log("New connection state:", connectionState);
  }, [connectionState]);

  // On game state change
  useEffect(() => {
    
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
    switch (connectionState) {
      case ConnectionState.CONNECTING:
        return <Loading text="Connecting to server, please wait" />;
      case ConnectionState.CONNECTED:
        return <Loading text="Joining a game room, please wait" />;
      case ConnectionState.LOOKING_FOR_OPPONENT:
        return <Loading text="Looking for an opponent, please wait" />;
      case ConnectionState.IN_GAME:
        return (
          <GameBoard
            piecePickUpDropCallback={piecePickUpDropCallback}
            pieces={gamePieces}
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
            setConnectionState(ConnectionState.LOOKING_FOR_OPPONENT);
            break;
        case 'WelcomeNew':
          localStorage.setItem('UUID', tmp[1]);
          setConnectionState(ConnectionState.LOOKING_FOR_OPPONENT);
          break;
        case 'StartGame':
          setConnectionState(GameState.IN_GAME);
          setGameState.apply(GameState.LIGHT_TURN);
          setMyColor(parseInt(tmp[1]));
          setGamePieces(JSON.parse(tmp[2]).map((piece) => {
            return new GamePieceModel(piece.color, piece.type, piece.field_no)
          }));
          break;
        case "CurrentState":
          setMyColor(parseInt(tmp[1]));
          // TODO: Set connection state
          setConnectionState(ConnectionState.IN_GAME);
          setGameState(parseInt(tmp[2]));
          setGamePieces(JSON.parse(tmp[3]).map((piece) => {
            return new GamePieceModel(piece.color, piece.type, piece.field_no)
          }));
        }
    };
  });

  return (
    <div>
      <Header />
      // TODO: Add info about my color
      {/* <GameBoard
            piecePickUpDropCallback={piecePickUpDropCallback}
            pieces={[]}
            highlightedFields={highlightedFields}
          /> */}
      <Container>{getMainElement()}</Container>
    </div>
  );
}

// TODO: Handle reconnections

export default App;
