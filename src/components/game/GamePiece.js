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
    // const canvas = e.target.parent.canvas._canvas;
    // const canvasLeft = canvas.offsetLeft + canvas.clientLeft;
    // const canvasTop = canvas.offsetTop + canvas.clientTop;
    const x = e.evt.layerX;
    const y = e.evt.layerY;
    const fieldsInRow = 8;
    const fieldsInCol = 4;
    const totalUsableFields = fieldsInCol * fieldsInRow;
    const fieldSize = 1000 / fieldsInRow; // TODO: Don't use hardcoded values
    const xFieldSize = 2 * fieldSize; // There is unused white field between fields in a row
    const yFieldSize = fieldSize;
    const dropCol = Math.floor(x / xFieldSize);
    const dropRow = Math.floor(y / yFieldSize);
    var newFieldNo = totalUsableFields - dropCol - fieldsInCol * dropRow;
    // Check whether the piece was dropped on a dark or a white field
    const dropColFullBoard = Math.floor(x / fieldSize);
    if (dropRow % 2 != dropColFullBoard % 2) {
      console.log("Dropped on:", newFieldNo);
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
