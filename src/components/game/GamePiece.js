import React, { useState, useRef, useEffect } from "react";
import { Image } from "react-konva";
import useImage from "use-image";

import lightManImg from "../../assets/light_man.png";
import lightKingImg from "../../assets/light_king.png";
import darkManImg from "../../assets/dark_man.png";
import darkKingImg from "../../assets/dark_king.png";
import { GamePieceColor, GamePieceType } from "../../models/GamePieceModel";

const GamePiece = (props) => {
  var image;
  if (props.piece.type === GamePieceType.MAN) {
    if (props.piece.color === GamePieceColor.LIGHT) {
      image = lightManImg;
    } else {
      image = darkManImg;
    }
  } else {
    if (props.piece.color === GamePieceColor.LIGHT) {
      image = lightKingImg;
    } else {
      image = darkKingImg;
    }
  }
  const [usedImage] = useImage(image);
  const pieceRef = React.useRef();

  useEffect(() => {
    props.piece.resetPositionFunc = resetPosition;
  });

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
    const fieldsInCol = 4;
    const totalUsableFields = fieldsInCol * fieldsInRow;
    const fieldSize = 1000 / fieldsInRow; // TODO: Don't use hardcoded values
    var newFieldNo =
      totalUsableFields -
      Math.floor(x / fieldSize) -
      fieldsInRow * Math.floor(y / fieldSize);
    const dropCol = Math.floor(x / fieldSize);
    const dropRow = Math.floor(y / fieldSize);
    if (dropRow % 2 != dropCol % 2) {
      // Check if piece was dropped on the usable field
      props.piecePickUpDropCallback(props.piece, false, newFieldNo);
    } else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    pieceRef.current.position({ x: props.piece.x, y: props.piece.y });
    props.redrawParent();
  }

  return (
    <Image
      image={usedImage}
      x={props.piece.x}
      y={props.piece.y}
      ref={pieceRef}
      draggable
      onDragStart={(e) => onDragStartCallback(e)}
      onDragEnd={(e) => {
        onDragEndCallback(e);
      }}
    />
  );
};

export default GamePiece;
