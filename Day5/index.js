import { canvasGrid } from "./grid.js";

// // canvas.addEventListener('wheel', (event) => {
// //   if (event.deltaY !== 0) {
// //     scrollTop += event.deltaY;
// //     scrollTop = Math.max(0, Math.min(scrollTop, (ROWS * ROW_HEIGHT) - canvas.height));
// //   }
// //   if (event.deltaX !== 0) {
// //     scrollLeft += event.deltaX;
// //     scrollLeft = Math.max(0, Math.min(scrollLeft, (COLS * COLUMN_WIDTH) - canvas.width));
// //   }
// //   drawGrid(filteredData);
// // });


const grid = new canvasGrid(
  "myCanvas",
  ".canvasContainer",
  "fixedRow",
  "fixedCol",
  "cellInput",
);
grid.render();
