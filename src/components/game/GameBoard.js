import React from "react";
import { Stage, Layer } from "react-konva";

import GameBoardBackground from "./GameBoardBackground";
import GamePiece from "./GamePiece";

const GameBoard = (props) => {
  const layerRef = React.useRef();

  const redraw = () => {
    layerRef.current.draw();
  };

  return (
    <div>
      <h2>{props.name}</h2>
      <Stage width={props.dimensions.width} height={props.dimensions.height}>
        <GameBoardBackground
          highlightedFields={props.highlightedFields}
          dimensions={props.dimensions}
        />
        <Layer ref={layerRef}>
          {props.pieces.map((piece) => {
            return (
              <GamePiece
                key={piece.fieldNo}
                piece={piece}
                piecePickUpDropCallback={props.piecePickUpDropCallback}
                redrawParent={redraw}
                boardDimensions={props.dimensions}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default GameBoard;
