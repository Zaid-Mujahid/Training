const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const mainCanvasContainer = document.querySelector(".canvasContainer");
// const chartCanvas = document.getElementById("myGraph");

const fixedRowCanvas = document.getElementById("fixedRow");
const fixedColCanvas = document.getElementById("fixedCol");
const ctxFixedRow = fixedRowCanvas.getContext("2d");
const ctxFixedCol = fixedColCanvas.getContext("2d");

// new Chart(chartCanvas, {
//   type: "bar",
//   data: {
//     labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
//     datasets: [
//       {
//         label: "# of Votes",
//         data: [12, 19, 3, 5, 2, 3],
//         borderWidth: 1,
//       },
//     ],
//   },
//   options: {
//     scales: {
//       y: {
//         beginAtZero: true,
//       },
//     },
//   },
// });

const cellInput = document.getElementById("cellInput");

document
  .getElementById("fileInput")
  .addEventListener("change", handleFileUplaod);
document.getElementById("insertRowBtn").addEventListener("click", insertRow);
document.getElementById("deleteRowBtn").addEventListener("click", deleteRow);
document.getElementById("updateRowBtn").addEventListener("click", updateRow);

let CELL_HEIGHT = 30;
let ROWS = 100;
let COLS = 50;
const RESIZE_HANDLE_WIDTH = 5;

let columnWidths = Array(COLS).fill(100);
let data = Array(ROWS)
  .fill()
  .map(() => Array(COLS).fill(""));
let isResizing = false;
let resizingColumn = -1;

let scrollTop = 0;
let scrollLeft = 0;
const ROW_HEIGHT = CELL_HEIGHT;
const COLUMN_WIDTH = columnWidths[0];

function handleFileUplaod(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const contents = e.target.result;
    const rows = contents.split("\n").map((row) => row.split(","));
    ROWS = rows.length;
    COLS = rows[0].length;
    data = rows;
    columnWidths = Array(COLS).fill(100);

    render();
  };
  reader.readAsText(file);
}

function insertRow() {
  const newRow = Array(COLS).fill("");
  data.push(newRow);
  ROWS++;
  render();
}

function deleteRow() {
  if (ROWS > 0) {
    data.pop();
    ROWS--;
    render();
  }
}

function updateRow() {
  const rowIndex = prompt("Enter the row index to update:");
  if (rowIndex !== null && rowIndex >= 0 && rowIndex < ROWS) {
    const newRowData = prompt("Enter the new row data, separated by commas:");
    if (newRowData !== null) {
      const newRow = newRowData.split(",");
      if (newRow.length === COLS) {
        data[rowIndex] = newRow;
        render();
      } else {
        alert(`Invalid data. Expected ${COLS} columns.`);
      }
    }
  }
}
function fixedRow() {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctxFixedRow.clearRect(0, 0, fixedRowCanvas.width, fixedRowCanvas.height);
  let x = 0;
  for (let j = 0; j <= COLS; j++) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CELL_HEIGHT);
    ctx.stroke();
    ctxFixedRow.fillStyle = "lightgray";
    ctxFixedRow.fillRect(x, 0, columnWidths[j], CELL_HEIGHT);
    ctxFixedRow.fillStyle = "black";
    ctxFixedRow.fillText(String.fromCharCode(65 + j), x + 5, CELL_HEIGHT / 2);
    x += columnWidths[j];
  }
}

function drawFixedCol() {
  ctxFixedCol.strokeStyle = "black";
  ctxFixedCol.lineWidth = 1;
  ctxFixedCol.clearRect(0, 0, fixedColCanvas.width, fixedColCanvas.height);
  let y = 0;
  for (let i = 0; i < ROWS; i++) {
    ctxFixedCol.beginPath();
    ctxFixedCol.moveTo(0, y);
    ctxFixedCol.lineTo(fixedColCanvas.width, y);
    ctxFixedCol.stroke();
    ctxFixedCol.fillStyle = "lightgrey";
    ctxFixedCol.fillRect(0, y, fixedColCanvas.width, CELL_HEIGHT);
    ctxFixedCol.fillStyle = "black";
    ctxFixedCol.fillText(i + 1, 5, y + CELL_HEIGHT / 2);
    y += CELL_HEIGHT;
  }
}

fixedRowCanvas.addEventListener("click", (e) => {
  const rect = fixedRowCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const col = getColumnAtX(x);

  if (col !== -1 && col < COLS) {
    selectColumn(col);
  }
});

function selectColumn(col) {
  selectedCells = [];
  for (let row = 0; row < ROWS; row++) {
    selectedCells.push({ row, col, dataAtRowAndCol: data[row][col] });
  }
  highlightSelection();
}

fixedColCanvas.addEventListener("click", (e) => {
  const rect = fixedColCanvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const row = Math.floor(y / CELL_HEIGHT);

  if (row !== -1 && row < ROWS) {
    selectRow(row);
  }
});

function selectRow(row) {
  selectedCells = [];
  for (let col = 0; col < COLS; col++) {
    selectedCells.push({ row, col, dataAtRowAndCol: data[row][col] });
  }
  highlightSelection();
}

function drawGrid(filteredData) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 0.5;

  let x = 0;
  for (let j = 0; j <= COLS; j++) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();

    if (j < COLS) {
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(
        x - RESIZE_HANDLE_WIDTH / 2,
        0,
        RESIZE_HANDLE_WIDTH,
        canvas.height
      );
    }
    if (j < COLS) x += columnWidths[j];
  }

  let y = 0;
  for (let i = 0; i <= ROWS; i++) {
    // if (filteredData[i]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(COLS * 100, y);
    ctx.stroke();
    y += CELL_HEIGHT;
    // console.log(y);
    // }
  }
}
// with rectangles
// function drawGrid(filteredData) {
//   ctx.strokeStyle = "black";
//   ctx.lineWidth = 1;

//   let x = 0;
//   for (let j = 0; j < COLS; j++) {
//     let y = 0;
//     for (let i = 0; i < ROWS; i++) {
//       if (filteredData[i]) {
//         ctx.fillStyle = "white";
//         ctx.fillRect(x, y, columnWidths[j], CELL_HEIGHT);
//         ctx.strokeRect(x, y, columnWidths[j], CELL_HEIGHT);
//         y += CELL_HEIGHT;
//       }
//     }
//     x += columnWidths[j];
//   }
// }
function drawCellContents(filteredData) {
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";

  let y = 0;
  for (let i = 0; i < ROWS; i++) {
    if (filteredData[i]) {
      let x = 0;
      for (let j = 0; j < COLS; j++) {
        if (data[i] && data[i][j] !== undefined) {
          ctx.fillText(data[i][j], x + 5, y + CELL_HEIGHT / 2);
        }
        x += columnWidths[j];
      }
      y += CELL_HEIGHT;
    }
  }
}

function render(filteredData = data.map(() => true)) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fixedRow();
  drawFixedCol();
  drawGrid(filteredData);
  drawCellContents(filteredData);
}

function getColumnAtX(x) {
  let accumulatedWidth = 0;
  for (let i = 0; i < COLS; i++) {
    accumulatedWidth += columnWidths[i];
    if (x < accumulatedWidth) return i;
  }
  return -1;
}

function getColumnLeftPosition(col) {
  let x = 0;
  for (let i = 0; i < col; i++) {
    x += columnWidths[i];
  }
  return x;
}

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = getColumnAtX(x);

  if (
    col > 0 &&
    Math.abs(x - getColumnLeftPosition(col)) < RESIZE_HANDLE_WIDTH / 2
  ) {
    isResizing = true;
    resizingColumn = col - 1;
    canvas.style.cursor = "col-resize";
  }

  canvas.addEventListener("mouseup", () => {
    return;
  });
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;

  if (isResizing) {
    const newWidth = x - getColumnLeftPosition(resizingColumn);
    if (newWidth > 10) {
      columnWidths[resizingColumn] = newWidth;
      render();
    }
  } else {
    const col = getColumnAtX(x);
    if (
      col > 0 &&
      Math.abs(x - getColumnLeftPosition(col)) < RESIZE_HANDLE_WIDTH / 2
    ) {
      canvas.style.cursor = "col-resize";
    } else {
      canvas.style.cursor = "default";
    }
  }
});

canvas.addEventListener("mouseup", () => {
  isResizing = false;
  resizingColumn = -1;
  canvas.style.cursor = "default";
});
const innerCanvasContainer = document.querySelector(".innerCanvasContainer");
canvas.addEventListener("dblclick", (e) => {
  if (!isResizing) {
    const rect = canvas.getBoundingClientRect();
    const containerRect = innerCanvasContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = getColumnAtX(x);
    const row = Math.floor(y / CELL_HEIGHT);

    if (col !== -1 && row < ROWS) {
      cellInput.style.display = "block";
      cellInput.style.left = `${
        rect.left + getColumnLeftPosition(col) - containerRect.left
      }px`;
      cellInput.style.top = `${
        rect.top + row * CELL_HEIGHT - containerRect.top
      }px`;
      cellInput.style.width = `${columnWidths[col] - 8}px`;
      cellInput.style.height = `${CELL_HEIGHT - 5}px`;
      cellInput.value = data[row][col];
      cellInput.focus();

      cellInput.onblur = () => {
        data[row][col] = cellInput.value;
        cellInput.style.display = "none";
        render();
      };
    }
  }
});

//for selection
let selectedCells = [];
let isSelecting = false;
let startCell = null;

canvas.addEventListener("mousedown", (e) => {
  console.log(e);
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  console.log(x, y);

  const col = getColumnAtX(x);
  const row = Math.floor(y / CELL_HEIGHT);
  let dataAtRowAndCol = data[row][col];
  startCell = { row, col, dataAtRowAndCol };
  selectedCells = [startCell];
  console.log(selectedCells);
  isSelecting = true;

  highlightSelection();

  // Add mousemove event listener
  canvas.addEventListener("mousemove", onMouseMove);

  // Add mouseup event listener
  canvas.addEventListener("mouseup", onMouseUp, { once: true });
});

function onMouseMove(e) {
  if (!isSelecting) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = getColumnAtX(x);
  const row = Math.floor(y / CELL_HEIGHT);
  let dataAtRowAndCol = data[row][col];
  const cell = { row, col, dataAtRowAndCol };

  selectedCells = getSelectedCells(startCell, cell);

  highlightSelection();
}

const maxValue = document.querySelector(".max-value");
const minValue = document.querySelector(".min-value");
const avgValue = document.querySelector(".avg-value");
const sumValue = document.querySelector(".sum-value");
const cntValue = document.querySelector(".cnt-value");

function onMouseUp(e) {
  canvas.removeEventListener("mousemove", onMouseMove);
  isSelecting = false;
  const dataAtRowAndColArray = selectedCells.map((obj) => obj.dataAtRowAndCol);

  if (dataAtRowAndColArray.length > 0) {
    const minimum = Math.min(...dataAtRowAndColArray);
    const maximum = Math.max(...dataAtRowAndColArray);
    let sum = 0;
    for (let i = 0; i < dataAtRowAndColArray.length; i++) {
      sum += parseFloat(dataAtRowAndColArray[i]);
    }
    const avg = sum / dataAtRowAndColArray.length;
    const count = dataAtRowAndColArray.length;

    minValue.textContent = `Min: ${minimum}`;
    maxValue.textContent = `Max: ${maximum}`;
    avgValue.textContent = `Avg: ${avg.toFixed(2)}`;
    sumValue.textContent = `Sum: ${sum}`;
    cntValue.textContent = `Cell count: ${count}`;
  }
  selectedCells = [];
}

function getSelectedCells(start, end) {
  const selected = [];
  const startRow = Math.min(start.row, end.row);
  const endRow = Math.max(start.row, end.row);
  const startCol = Math.min(start.col, end.col);
  const endCol = Math.max(start.col, end.col);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      let dataAtRowAndCol = data[row][col];
      selected.push({ row, col, dataAtRowAndCol });
    }
  }
  return selected;
}
function highlightSelection() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(data.map(() => true));
  drawCellContents(data.map(() => true));

  if (selectedCells.length == 1) {
    ctx.fillStyle = "white";
    selectedCells.forEach((cell) => {
      const x = getColumnLeftPosition(cell.col);
      const y = cell.row * CELL_HEIGHT;
      ctx.fillRect(x, y, columnWidths[cell.col], CELL_HEIGHT);
    });
  }

  ctx.fillStyle = "rgb(0, 128, 0, 0.1)";
  selectedCells.slice(1).forEach((cell) => {
    const x = getColumnLeftPosition(cell.col);
    const y = cell.row * CELL_HEIGHT;
    ctx.fillRect(x, y, columnWidths[cell.col], CELL_HEIGHT);
  });

  if (selectedCells.length > 0) {
    const minRow = Math.min(...selectedCells.map((cell) => cell.row));
    const maxRow = Math.max(...selectedCells.map((cell) => cell.row));
    const minCol = Math.min(...selectedCells.map((cell) => cell.col));
    const maxCol = Math.max(...selectedCells.map((cell) => cell.col));

    const xStart = getColumnLeftPosition(minCol);
    const yStart = minRow * CELL_HEIGHT;
    const xEnd = getColumnLeftPosition(maxCol) + columnWidths[maxCol];
    const yEnd = (maxRow + 1) * CELL_HEIGHT;

    // border
    ctx.strokeStyle = "rgba(0, 128, 0, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
  }

  drawCellContents(data.map(() => true));
}
// function highlightSelection() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   drawGrid(data.map(() => true));
//   drawCellContents(data.map(() => true));

//   ctx.fillStyle = "rgba(0, 128, 0, 0.1)";
//   selectedCells.forEach((cell) => {
//     const x = getColumnLeftPosition(cell.col);
//     const y = cell.row * CELL_HEIGHT;
//     ctx.fillRect(x, y, columnWidths[cell.col], CELL_HEIGHT);
//     ctx.strokeRect(x, y, columnWidths[cell.col], CELL_HEIGHT);
//   });
//   drawCellContents(data.map(() => true));
// }

function handleSearch() {
  let input = document.querySelector("#searchInput").value.toLowerCase();
  let filteredData = data.map((row) =>
    row.some((cell) => cell.toString().toLowerCase().includes(input))
  );
  render(filteredData);
}

function handleReplace() {
  let searchInput = document.querySelector("#searchInput").value.toLowerCase();
  let replaceInput = document.querySelector("#replaceInput").value;

  if (searchInput === "") return;

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (data[i][j].toString().toLowerCase().includes(searchInput)) {
        data[i][j] = data[i][j]
          .toString()
          .replace(new RegExp(searchInput, "gi"), replaceInput);
      }
    }
  }
  handleSearch();
  render();
  alert("data replaced successfully!");
}
render();

// canvas.addEventListener("scroll", (e)=>{
//   const { scrollTop, clientHeight, scrollHeight } = e.target;
//   if(scrollTop + clientHeight >= scrollHeight - 50){
//     const newRows = 30;
//     const newRowsData = Array(newRows).fill().map(()=>Array(COLS).fill(""));
//     data = data.concat(newRowsData);
//     console.log(data);

//     currentHeight += newRows * CELL_HEIGHT;
//     canvas.height = currentHeight;
//     fixedColCanvas.height = currentHeight;

//     ROWS += newRows;
//     render();
//   }
// })
let currentHeight = canvas.height;
let currentWidth = canvas.width;
let currentRows = ROWS;
let currentCols = COLS;

document.addEventListener("scroll", resizeGrid);

function resizeGrid() {
  const scrollHeight = canvas.scrollHeight;
  const clientHeight = canvas.clientHeight;
  const scrollTop = canvas.scrollTop;

  const scrollWidth = document.documentElement.scrollWidth;
  const clientWidth = document.documentElement.clientWidth;
  const scrollLeft = document.documentElement.scrollLeft;

  if (scrollTop + clientHeight >= scrollHeight - 50) {
    // currentHeight += 100;
    // canvas.height = currentHeight;
    // fixedColCanvas.height = currentHeight;
    // currentRows += 30;
    // ROWS = currentRows;
    const newRows = 30;
    const newRowData = Array(newRows)
      .fill()
      .map(() => Array(COLS).fill(""));

    data = data.concat(newRowData);

    currentHeight += newRows * CELL_HEIGHT;
    canvas.height = currentHeight;
    fixedColCanvas.height = currentHeight;

    currentRows += newRows;
    ROWS = currentRows;
    render();
    // console.log(scrollWidth);
    // console.log(clientWidth);
    // console.log(scrollLeft);
    //   if(scrollLeft + clientWidth >= scrollWidth - 50){
    //     currentWidth += 500
    //     canvas.width = currentWidth;
    //     fixedRowCanvas.width = currentWidth;
    //     currentCols += 30;
    //     COLS = currentCols;
    //     drawGrid()
    //     fixedRow();
  }
}

// canvas.addEventListener('wheel', (event) => {
//   if (event.deltaY !== 0) {
//     scrollTop += event.deltaY;
//     scrollTop = Math.max(0, Math.min(scrollTop, (ROWS * ROW_HEIGHT) - canvas.height));
//   }
//   if (event.deltaX !== 0) {
//     scrollLeft += event.deltaX;
//     scrollLeft = Math.max(0, Math.min(scrollLeft, (COLS * COLUMN_WIDTH) - canvas.width));
//   }
//   drawGrid(filteredData);
// });
