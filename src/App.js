import React, { useState, useEffect, useRef } from "react";
import { Container, Modal, Button, Alert } from "react-bootstrap";

import "./App.css";
import Loading from "./components/Loading";
import Header from "./components/Header";
import GameBoard from "./components/game/GameBoard";
import GameState, { GameError } from "./models/GameModel";
import GamePieceModel, {
  GamePieceColor,
  GamePieceType,
} from "./models/GamePieceModel";

const ConnectionState = {
  CONNECTING: 0,
  CONNECTED: 1,
  LOOKING_FOR_OPPONENT: 2,
  IN_GAME: 3,
};

function App() {
  const [connectionState, setConnectionState] = useState(
    ConnectionState.CONNECTING
  );
  const [gameState, setGameState] = useState(GameState.NOT_STARTED);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [gamePieces, setGamePieces] = useState([]);
  const [myColor, setMyColor] = useState(null);
  const [nextNegativeField, setNextNegativeField] = useState(-1);
  const [endGameCard, setEndGameCard] = useState({
    show: false,
    title: "",
    content: "",
  });
  const [infoMessage, setInfoMessage] = useState({
    show: false,
    type: "",
    content: "",
  });

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
    switch (gameState) {
      case GameState.LIGHT_TURN:
        if (myColor === GamePieceColor.LIGHT) {
          setGamePieces(
            gamePieces.map((piece) => {
              if (piece.color === myColor) {
                piece.moveable = true;
              } else {
                piece.moveable = false;
              }
              return piece;
            })
          );
        } else {
          setGamePieces(
            gamePieces.map((piece) => {
              piece.moveable = false;
              return piece;
            })
          );
        }
        break;
      case GameState.DARK_TURN:
        if (myColor === GamePieceColor.DARK) {
          setGamePieces(
            gamePieces.map((piece) => {
              if (piece.color === myColor) {
                piece.moveable = true;
              } else {
                piece.moveable = false;
              }
              return piece;
            })
          );
        } else {
          setGamePieces(
            gamePieces.map((piece) => {
              piece.moveable = false;
              return piece;
            })
          );
        }
        break;
      default:
        setGamePieces(
          gamePieces.map((piece) => {
            piece.moveable = false;
            return piece;
          })
        );
        break;
    }
  }, [gameState]);

  const piecePickUpDropCallback = (
    piece,
    pickedUpOrDropped,
    dropFieldNo = undefined
  ) => {
    // pickedUpOrDropped: true means picked up, false dropped down
    if (pickedUpOrDropped) {
      // picked up
      setSelectedPiece(piece);
      setHighlightedFields(piece.getPossibleMoves(gamePieces));
    } else {
      // dropped
      setSelectedPiece(null);
      setHighlightedFields([]);
      socket.current.send(`Move;${piece.fieldNo};${dropFieldNo}`);
    }
  };

  const hideEndGameCard = () => {
    setEndGameCard({ ...endGameCard, show: false });
  };

  const showEndGameCardIfNeeded = () => {
    var title;
    var content;
    switch (gameState) {
      case GameState.DARK_WON:
        title = "Dark player has won!";
        if (myColor == GamePieceColor.DARK) {
          content = "Congratulations, you've won the game!";
        } else {
          content = "Unfortunatelly, you've lost the game";
        }
        setEndGameCard({ show: true, title: title, content: content });
        break;
      case GameState.LIGHT_WON:
        title = "Light player has won!";
        if (myColor == GamePieceColor.LIGHT) {
          content = "Congratulations, you've won the game!";
        } else {
          content = "Unfortunatelly, you've lost the game";
        }
        setEndGameCard({ show: true, title: title, content: content });
        break;
      case GameState.TIE:
        title = "The game has ended with a tie";
        content =
          "Neither you nor your opponent can make any move, it's a tie!";
        setEndGameCard({ show: true, title: title, content: content });
        break;
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
      default:
        return (
          <div>
            <Modal show={endGameCard.show} onHide={hideEndGameCard}>
              <Modal.Header closeButton>
                <Modal.Title>{endGameCard.title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>{endGameCard.content}</Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={hideEndGameCard}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
            <Alert
              className="info_box"
              show={infoMessage.show}
              key={1}
              variant={infoMessage.type}
              onClose={() => setInfoMessage({ ...infoMessage, show: false })}
              dismissible
            >
              {infoMessage.content}
            </Alert>
            <GameBoard
              piecePickUpDropCallback={piecePickUpDropCallback}
              pieces={gamePieces}
              highlightedFields={highlightedFields}
            />
          </div>
        );
    }
  };

  // Receiving messages
  useEffect(() => {
    socket.current.onmessage = (e) => {
      console.log("Server said: ", e.data);
      const tmp = e.data.split(";");
      var piece;
      var fieldNo;
      var targetFieldNo;
      var capturedFieldNo;
      var promote;
      var endTurn;
      var errorCode;
      var content;
      switch (tmp[0]) {
        case "Welcome":
          setConnectionState(ConnectionState.LOOKING_FOR_OPPONENT);
          break;
        case "WelcomeNew":
          localStorage.setItem("UUID", tmp[1]);
          setConnectionState(ConnectionState.LOOKING_FOR_OPPONENT);
          break;
        case "StartGame":
          setConnectionState(ConnectionState.IN_GAME);
          setMyColor(parseInt(tmp[1]));
          setGamePieces(
            JSON.parse(tmp[2]).map((piece) => {
              return new GamePieceModel(
                piece.color,
                piece.type,
                piece.field_no
              );
            })
          );
          setGameState(GameState.LIGHT_TURN);
          break;
        case "CurrentState":
          setMyColor(parseInt(tmp[1]));
          // TODO: Set connection state
          setConnectionState(ConnectionState.IN_GAME);
          setGamePieces(
            JSON.parse(tmp[3]).map((piece) => {
              return new GamePieceModel(
                piece.color,
                piece.type,
                piece.field_no
              );
            })
          );
          setGameState(parseInt(tmp[2]));
          showEndGameCardIfNeeded();
          break;
        case "WrongMove":
          fieldNo = parseInt(tmp[1]);
          errorCode = parseInt(tmp[2]);
          piece = gamePieces.filter(function (piece) {
            return piece.fieldNo === fieldNo;
          })[0];
          piece.resetPositionFunc();
          content = "Wrong move! ";
          switch (errorCode) {
            case GameError.CANT_MOVE_PIECE:
              content += "The piece cannot move to the chosen field";
              break;
            case GameError.FIELD_TAKEN:
              content += "The chosen field is taken";
              break;
            case GameError.ILLEGAL_MOVE:
              content += "This move is illegal";
              break;
            case GameError.MUST_CAPTURE:
              content +=
                "You have a possibility to capture so you have to do it";
              break;
            case GameError.NOT_KING:
              content +=
                "The chosen piece is not a king so it cannot move backwards";
              break;
            case GameError.NOT_YOUR_PIECE:
              content += "The chosen piece doesn't belong to you";
              break;
            case GameError.NOT_YOUR_TURN:
              content += "It's not your turn";
              break;
            case GameError.MUST_USE_SAME_PIECE:
              content += "You have to use the same piece as last time";
              break;
          }
          setInfoMessage({ show: true, type: "danger", content: content });
          break;
        case "Move":
          fieldNo = parseInt(tmp[1]);
          targetFieldNo = parseInt(tmp[2]);
          endTurn = tmp[3] === "True";
          promote = tmp[4] === "True";
          capturedFieldNo = parseInt(tmp[5]);
          setGamePieces(
            gamePieces.map((piece) => {
              if (piece.fieldNo === fieldNo) {
                piece.setField(targetFieldNo);
                if (promote) {
                  piece.type = GamePieceType.KING;
                }
              }
              if (piece.fieldNo === capturedFieldNo) {
                piece.setField(nextNegativeField);
              }
              return piece;
            })
          );
          if (capturedFieldNo) {
            setNextNegativeField(nextNegativeField - 1);
          }
          if (endTurn) {
            setGameState(
              gameState === GameState.LIGHT_TURN
                ? GameState.DARK_TURN
                : GameState.LIGHT_TURN
            );
          }
          break;
        case "GameEnd":
          setGameState(parseInt(tmp[1]));
          showEndGameCardIfNeeded();
      }
    };
  });

  return (
    <div>
      <Header myColor={myColor} gameState={gameState} />
      <Container>{getMainElement()}</Container>
    </div>
  );
}

// TODO: Handle reconnections

export default App;
