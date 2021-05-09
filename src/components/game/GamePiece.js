import React, { useState } from "react";
import { Image } from "react-konva";
import useImage from "use-image";

import lightManImg from "../../assets/light_man.png";
import lightKingImg from "../../assets/light_king.png";
import darkManImg from "../../assets/dark_man.png";
import darkKingImg from "../../assets/dark_king.png";
import { GamePieceType } from "../../models/GamePieceModel";

const GamePiece = (props) => {
  var image;
  switch (props.piece.type) {
    case GamePieceType.LIGHT_MAN:
      image = lightManImg;
      break;
    case GamePieceType.LIGHT_KING:
      image = lightKingImg;
      break;
    case GamePieceType.DARK_MAN:
      image = darkManImg;
      break;
    case GamePieceType.DARK_KING:
      image = darkKingImg;
      break;
  }
  const [usedImage] = useImage(image);

  const onDragStartCallback = (e) => {
    props.piecePickUpDropCallback(props.piece, true);
  };

  const onDragEndCallback = (e) => {
    const canvas = e.target.parent.canvas._canvas;
    const canvasLeft = canvas.offsetLeft + canvas.clientLeft;
    const canvasTop = canvas.offsetTop + canvas.clientTop;
    const x = e.target.x() - canvasLeft;
    const y = e.target.y() - canvasTop;
    const fieldsInRow = 8;
    const fieldSize = 1000 / fieldsInRow; // TODO: Don't use hardcoded values
    var newFieldNo =
      fieldsInRow * fieldsInRow -
      Math.floor(x / fieldSize) -
      fieldsInRow * Math.floor(y / fieldSize);
    console.log("Dragged", props.piece.fieldNo, newFieldNo);
    props.piecePickUpDropCallback(props.piece, false);
  };

  return (
    <Image
      image={usedImage}
      x={props.piece.x}
      y={props.piece.y}
      draggable
      onDragStart={(e) => onDragStartCallback(e)}
      onDragEnd={(e) => {
        onDragEndCallback(e);
      }}
    />
  );
};

export default GamePiece;
