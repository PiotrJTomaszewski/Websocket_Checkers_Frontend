import React, { useEffect, useState } from "react";
import { Layer, Shape } from "react-konva";

const GameBoardBackground = (props) => {
  const [mainElement, setMainElement] = useState(<Shape />);

  // On highlightedFields change
  useEffect(() => {
    const fieldsInRow = 8;
    const fieldsInCol = 4; // Only 4 usable fields in col
    const totalUsableFields = fieldsInCol * fieldsInRow;
    const fieldSize = props.dimensions.width / fieldsInRow;

    function fieldNoToXY(fieldNo) {
      const col = (totalUsableFields - fieldNo) % fieldsInCol;
      const row = Math.floor((totalUsableFields - fieldNo) / fieldsInCol);
      const xFieldSize = 2 * fieldSize; // There is unused white field between fields in row
      const yFieldSize = fieldSize;
      let x = col * xFieldSize;
      if (row % 2 === 0) {
        // Even rows start with an unused field
        x += fieldSize;
      }
      let y = row * yFieldSize;
      return { x: x, y: y };
    }

    function colorizeFields(ctx) {
      // Color usable fields
      ctx.fillStyle = "#0F0";
      for (let i = 1; i <= totalUsableFields; i++) {
        let xy = fieldNoToXY(i);
        ctx.fillRect(xy.x, xy.y, fieldSize, fieldSize);
      }
    }

    function drawBoard(ctx) {
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
      for (let i = 1; i <= totalUsableFields; i++) {
        let xy = fieldNoToXY(i);
        let x = xy.x + fieldSize / 2;
        let y = xy.y + fieldSize - 3;
        ctx.fillText(i, x, y);
      }
    }

    function highlightFields(ctx) {
      ctx.save();
      ctx.fillStyle = "#FF0";
      // console.log("Fields to highlight", props.highlightedFields);
      props.highlightedFields.forEach((fieldNo) => {
        let xy = fieldNoToXY(fieldNo);
        ctx.fillRect(xy.x, xy.y, fieldSize, fieldSize);
      });
      ctx.restore();
    }

    setMainElement(
      <Shape
        sceneFunc={(context, shape) => {
          colorizeFields(context);
          highlightFields(context);
          drawBoard(context);
        }}
      />
    );
  }, [props.highlightedFields, props.dimensions.width]);

  return <Layer>{mainElement}</Layer>;
};

export default GameBoardBackground;
