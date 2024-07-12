import React from "react";
import { useEffect, useRef } from "react";

const Dashboard = ({ data }) => {
  const canvasRef = useRef(null);
  const cellWidth = 150;
  const cellHeight = 60;
  useEffect(() => {
    console.log(data);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach((item, rowIndex) => {
      const y = rowIndex * cellHeight;
      let x = 0;
      Object.values(item).forEach((value) => {
        ctx.strokeRect(x, y, cellWidth, cellHeight);
        ctx.fillText(String(value), x + 5, y + 20);
        x += cellWidth;
      });
    });
  }, []);

  return (
    <>
      <div>
        <canvas ref={canvasRef} width={800} height={400}></canvas>
      </div>
    </>
  );
};

export default Dashboard;
