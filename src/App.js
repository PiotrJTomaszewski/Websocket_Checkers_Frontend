import React, { useState, useEffect, useRef } from "react";
import { Container, Modal, Button, Alert} from "react-bootstrap";
import { withOneTabEnforcer } from "react-one-tab-enforcer";

import "./App.css";
import Loading from "./components/Loading";
import Header from "./components/Header";
import GameBoard from "./components/game/GameBoard";
import GameState, { GameError } from "./models/GameModel";
import GamePieceModel, {
  GamePieceColor,
  GamePieceType,
} from "./models/GamePieceModel";
import MessageType, { decodeMessage, encodeMessage } from "./models/MessageModel";

const ConnectionState = {
  CONNECTING: 0,
  CONNECTED: 1,
  LOOKING_FOR_OPPONENT: 2,
  IN_GAME: 3,
};

const OneTabWarningComponent = () => {
  return(
    <Container>
        <h1  className="one_tab_warning">Sorry! You can only have this application opened in one tab</h1>
    </Container>
  );
}

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
    socket.current.binaryType = 'arraybuffer';
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
          socket.current.send(encodeMessage(MessageType.JOIN_NEW));
        } else {
          console.log("Sent:", `JoinExisting;${playerUUID}`);
          socket.current.send(encodeMessage(MessageType.JOIN_EXISTING, {uuid: playerUUID}));
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
        console.log(`Move;${piece.fieldNo};${dropFieldNo}`);
        socket.current.send(encodeMessage(MessageType.MOVE, {from: piece.fieldNo, to: dropFieldNo}));
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
      const decodedMessage = decodeMessage(e.data);
      console.log("Message received:", decodedMessage);
      switch (decodedMessage.type) {
        case MessageType.WELCOME:
          setConnectionState(ConnectionState.LOOKING_FOR_OPPONENT);
          break;
        case MessageType.WELCOME_NEW:
          localStorage.setItem("UUID", decodedMessage.uuid);
          setConnectionState(ConnectionState.LOOKING_FOR_OPPONENT);
          break;
        case MessageType.START_GAME:
          setConnectionState(ConnectionState.IN_GAME);
          myColor.current = decodedMessage.color;
          let pieces = [];
          for (let i=1; i<=12; i++) {
            pieces[i] = new GamePieceModel(GamePieceColor.DARK, GamePieceType.MAN, i, gameBoardDimensions);
            pieces[i+20] = new GamePieceModel(GamePieceColor.LIGHT, GamePieceType.MAN, i+20, gameBoardDimensions);
          }
          setGamePieces(pieces);
          setGameState(GameState.LIGHT_TURN);
          break;
        case MessageType.CURRENT_STATE:
          myColor.current = decodedMessage.color;
          // TODO: Set connection state
          setConnectionState(ConnectionState.IN_GAME);  
          setGamePieces(
            decodedMessage.pieces.map((piece) => {
              return new GamePieceModel(
                piece.color,
                piece.type,
                piece.fieldNo,
                gameBoardDimensions
              );
            })
          );
          setHighlightedFields([]);
          setGameState(decodedMessage.gameState);
          break;
        case MessageType.WRONG_MOVE:
          let piece = gamePieces.find(function (piece) {
            return piece.fieldNo === decodedMessage.from;
          });
          piece.resetPositionFunc();
          let content = "Wrong move! ";
          switch (decodedMessage.error) {
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
        case MessageType.MOVE_OK:
          setGamePieces(
            gamePieces.map((piece) => {
              if (piece.fieldNo === decodedMessage.from) {
                piece.setField(decodedMessage.to);
                if (decodedMessage.promote) {
                  piece.type = GamePieceType.KING;
                }
              }
              if (piece.fieldNo === decodedMessage.capturedFieldNo) {
                piece.setField(nextNegativeField.current--);
              }
              return piece;
            })
          );
          if (decodedMessage.endTurn) {
            setGameState(
              gameState === GameState.LIGHT_TURN
                ? GameState.DARK_TURN
                : GameState.LIGHT_TURN
            );
          }
          break;
        case MessageType.GAME_END:
          setGameState(decodedMessage.gameState);
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

export default withOneTabEnforcer({appName: "checkersGameWebsocket", OnlyOneTabComponent: OneTabWarningComponent})(App);
