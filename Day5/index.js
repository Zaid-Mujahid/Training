const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const cellInput = document.getElementById("cellInput");

document
  .getElementById("fileInput")
  .addEventListener("change", handleFileUplaod);
document.getElementById("insertRowBtn").addEventListener("click", insertRow);
document.getElementById("deleteRowBtn").addEventListener("click", deleteRow);
document.getElementById("updateRowBtn").addEventListener("click", updateRow);

let CELL_HEIGHT = 30;
let ROWS = 200;
let COLS = 20;
const RESIZE_HANDLE_WIDTH = 5;

let columnWidths = Array(COLS).fill(100);
let data = Array(ROWS)
  .fill()
  .map(() => Array(COLS).fill(""));
let isResizing = false;
let resizingColumn = -1;

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

function drawGrid(filteredData) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

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
    if (filteredData[i]) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(COLS * 100, y);
      ctx.stroke();
      y += CELL_HEIGHT;
    }
  }
}

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

canvas.addEventListener("dblclick", (e) => {
  if (!isResizing) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = getColumnAtX(x);
    const row = Math.floor(y / CELL_HEIGHT);

    if (col !== -1 && row < ROWS) {
      cellInput.style.display = "block";
      cellInput.style.left = `${rect.left + getColumnLeftPosition(col)}px`;
      cellInput.style.top = `${rect.top + row * CELL_HEIGHT}px`;
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

// For selection
let selectedCells = [];
let isSelecting = false;

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = getColumnAtX(x);
  const row = Math.floor(y / CELL_HEIGHT);
  let dataAtRowAndCol = data[row][col];
  selectedCells = [{ row, col, dataAtRowAndCol }];
  isSelecting = true;

  if (!selectedCells.some((c) => c.row === row && c.col === col)) {
    selectedCells.push(cell);
  }
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

  if (!selectedCells.some((c) => c.row === row && c.col === col)) {
    selectedCells.push(cell);
  }

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

function highlightSelection() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  drawGrid(data.map(() => true)); 
  drawCellContents(data.map(() => true));

  ctx.fillStyle = "rgba(173, 216, 230, 0.5)"; 

  selectedCells.forEach((cell) => {
    const x = getColumnLeftPosition(cell.col);
    const y = cell.row * CELL_HEIGHT;
    ctx.fillRect(x, y, columnWidths[cell.col], CELL_HEIGHT);
  });
  drawCellContents(data.map(() => true)); 
}

function handleSearch() {
  let input = document.querySelector('#searchBtn').value.toLowerCase();
  let filteredData = data.map(row =>
    row.some(cell => cell.toString().toLowerCase().includes(input))
  );

  render(filteredData);
}

render();
