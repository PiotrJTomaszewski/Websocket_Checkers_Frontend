import React from "react";
import { Layer, Shape } from "react-konva";

const GameBoardBackground = (props) => {
  const fieldsInRow = 8;
  const totalFields = fieldsInRow * fieldsInRow;
  const fieldSize = 1000 / fieldsInRow; // TODO: Don't use hardcoded size

  const colorizeFields = (ctx) => {
    // Color usable fields
    ctx.fillStyle = "#0F0";
    for (let i = 0; i < fieldsInRow; i++) {
      let startJ = i % 2 == 0 ? 1 : 0;
      for (let j = startJ; j < fieldsInRow; j += 2) {
        let x = ((i * fieldsInRow + j) % fieldsInRow) * fieldSize;
        let y = Math.floor((i * fieldsInRow + j) / fieldsInRow) * fieldSize;
        ctx.fillRect(x, y, fieldSize, fieldSize);
      }
    }
  };

  const drawBoard = (ctx) => {
    ctx.fillStyle = "#000";
    // Draw lines
    for (let i = 0; i <= fieldsInRow; i++) {
      ctx.moveTo(i * fieldSize, 0);
      ctx.lineTo(i * fieldSize, ctx.canvas.height);
      ctx.stroke();
      ctx.moveTo(0, i * fieldSize);
      ctx.lineTo(ctx.canvas.width, i * fieldSize);
      ctx.stroke();
    }

    // Put field numbers
    for (let i = 0; i < totalFields; i++) {
      var x = (i % fieldsInRow) * fieldSize + fieldSize / 2;
      var y = Math.floor(i / fieldsInRow) * fieldSize + fieldSize - 3;
      ctx.fillText(totalFields - i, x, y);
    }
  };

  const highlightFields = (ctx) => {
    ctx.save();
    ctx.fillStyle = "#FF0";
    console.log('Fields to highlight', props.highlightedFields)
    props.highlightedFields.forEach((fieldNo) => {
      let x = ((totalFields - fieldNo) % fieldsInRow) * fieldSize;
      let y = Math.floor((totalFields - fieldNo) / fieldsInRow) * fieldSize;
      ctx.fillRect(x, y, fieldSize, fieldSize);
    });
    ctx.restore();
  };

  return (
    <Layer>
      <Shape
        sceneFunc={(context, shape) => {
          colorizeFields(context);
          highlightFields(context);
          drawBoard(context);
        }}
      />
    </Layer>
  );
};

export default GameBoardBackground;
