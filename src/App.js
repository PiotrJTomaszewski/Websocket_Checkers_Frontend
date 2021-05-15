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
  const [loading, setLoading] = useState({ show: false, content: "" });
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [gamePieces, setGamePieces] = useState([]);
  const [infoMessage, setInfoMessage] = useState({
    show: false,
    type: "",
    content: "",
  });
  const [endGameCard, setEndGameCard] = useState({
    show: false,
    title: "",
    content: "",
  });
  const [gameBoardDimensions, setGameBoardDimensions] = useState({width: 0, height: 0});

  const URL = "ws://localhost:8888/ws";
  const PROTOCOL_NAME = "checkers_game";
  const socket = useRef(null);
  const myColor = useRef(null);
  const nextNegativeField = useRef(-1);

  // Runs on start
  useEffect(() => {
    var smallerDim = (window.innerHeight-60) > window.innerWidth ? window.innerWidth : (window.innerHeight-60);
    setGameBoardDimensions({width: 0.9 * smallerDim, height: 0.9 * smallerDim});
    socket.current = new WebSocket(URL, PROTOCOL_NAME);
    socket.current.onopen = (e) => {
      console.log("Socket open");
      setConnectionState(ConnectionState.CONNECTED);
    };
    socket.current.onclose = (e) => {
      setConnectionState(ConnectionState.CONNECTING);
    }
    return () => {
      console.log("Socket close");
      socket.current.close();
    };
  }, []);

  // On connection state change
  useEffect(() => {
    var playerUUID;
    switch (connectionState) {
      case ConnectionState.CONNECTING:
        setLoading({show: true, content: "Connecting to server, please wait"});
        break;
      case ConnectionState.CONNECTED:
        playerUUID = localStorage.getItem("UUID");
        if (playerUUID === null) {
          console.log("Sent:", "JoinNew");
          socket.current.send("JoinNew");
        } else {
          console.log("Sent:", `JoinExisting;${playerUUID}`);
          socket.current.send(`JoinExisting;${playerUUID}`);
        }
        setLoading({show: true, content: "Joining a game room, please wait"});
        break;
        case ConnectionState.LOOKING_FOR_OPPONENT:
          setLoading({show: true, content: "Looking for an opponent, please wait"});
          break;
        default:
          setLoading({show: false});
          break;
    }
    console.log("New connection state:", connectionState);
  }, [connectionState]);

  // On game state change
  useEffect(() => {
    switch (gameState) {
      case GameState.LIGHT_TURN:
        if (myColor.current === GamePieceColor.LIGHT) {
          setGamePieces(g => g.map((piece) => {
              if (piece.color === myColor.current) {
                piece.moveable = true;
              } else {
                piece.moveable = false;
              }
              return piece;
            })
          );
        } else {
          setGamePieces(g => g.map((piece) => {
              piece.moveable = false;
              return piece;
            })
          );
        }
        break;
      case GameState.DARK_TURN:
        if (myColor.current === GamePieceColor.DARK) {
          setGamePieces(g => g.map((piece) => {
              if (piece.color === myColor.current) {
                piece.moveable = true;
              } else {
                piece.moveable = false;
              }
              return piece;
            })
          );
        } else {
          setGamePieces(g => g.map((piece) => {
              piece.moveable = false;
              return piece;
            })
          );
        }
        break;
      default:
        setGamePieces(g => g.map((piece) => {
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
    isMoveCorrect,
    dropFieldNo = undefined
  ) => {
    // pickedUpOrDropped: true means picked up, false dropped down
    if (pickedUpOrDropped) {
      // picked up
      let pieceIndex = gamePieces.indexOf(piece);
      var piecesCp = gamePieces;
      piecesCp.splice(pieceIndex, 1);
      piecesCp.push(piece);
      setGamePieces(piecesCp);
      setHighlightedFields(piece.getPossibleMoves(gamePieces));
    } else {
      // dropped
      setHighlightedFields([]);
      if (isMoveCorrect) {
        socket.current.send(`Move;${piece.fieldNo};${dropFieldNo}`);
      }
    }
  };

  // On game state change, display end game card
  useEffect(() => {
    var title;
    var content;
    switch (gameState) {
      case GameState.DARK_WON:
        title = "Dark player has won!";
        if (myColor.current === GamePieceColor.DARK) {
          content = "Congratulations, you've won the game!";
        } else {
          content = "Unfortunatelly, you've lost the game";
        }
        setEndGameCard({ show: true, title: title, content: content });
        break;
      case GameState.LIGHT_WON:
        title = "Light player has won!";
        if (myColor.current === GamePieceColor.LIGHT) {
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
      default:
        break;
    }
  }, [gameState]);

  // Receiving messages
  useEffect(() => {
    socket.current.onmessage = (e) => {
      console.log("Server said: ", e.data);
      const tmp = e.data.split(";");
      var pieces;
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
          myColor.current = parseInt(tmp[1]);
          pieces = [];
          for (let i=1; i<=12; i++) {
            pieces[i] = new GamePieceModel(GamePieceColor.DARK, GamePieceType.MAN, i, gameBoardDimensions);
            pieces[i+20] = new GamePieceModel(GamePieceColor.LIGHT, GamePieceType.MAN, i+20, gameBoardDimensions);
          }
          setGamePieces(pieces);
          setGameState(GameState.LIGHT_TURN);
          break;
        case "CurrentState":
          myColor.current = parseInt(tmp[1]);
          // TODO: Set connection state
          setConnectionState(ConnectionState.IN_GAME);  
          setGamePieces(
            JSON.parse(tmp[3]).map((piece) => {
              return new GamePieceModel(
                piece.color,
                piece.type,
                piece.field_no,
                gameBoardDimensions
              );
            })
          );
          setHighlightedFields([]);
          setGameState(parseInt(tmp[2]));
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
            default:
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
                piece.setField(nextNegativeField.current--);
              }
              return piece;
            })
          );
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
          break;
        default:
          break;
      }
    };
  });

  return (
    <div>
      <Header myColor={myColor.current} gameState={gameState} />
      <Container fluid>
        <div>
          <Loading show={loading.show} text={loading.content} />
          <Modal show={endGameCard.show} onHide={() => {setEndGameCard({...endGameCard, show: false})}}>
            <Modal.Header closeButton>
              <Modal.Title>{endGameCard.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{endGameCard.content}</Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={() => {setEndGameCard({...endGameCard, show: false})}}>
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
            dimensions={gameBoardDimensions}
          />
        </div>
      </Container>
    </div>
  );
}

export default App;
