import { graph } from "./graph.js";
//array of cells data
/**
 * @typedef {Object} cell
 * @property {number} row
 * @property {number} col
 * @property {string} dataAtRowAndCol
 */
//to get selected cells array
/**
 * @typedef {Object} selectedCells
 * @property {number} row
 * @property {number} col
 */
//just one cell
/**
 * @typedef {Object} startCell
 * @property {number} row
 * @property {number} col
 * @property {string} dataAtRowAndCol
 */
export class canvasGrid {
  constructor(myCanvas, canvasContainer, fixedRow, fixedCol, cellInput) {
    this.canvas = document.getElementById(myCanvas);
    this.ctx = this.canvas.getContext("2d");
    this.mainCanvasContainer = document.querySelector(canvasContainer);
    this.fixedRowCanvas = document.getElementById(fixedRow);
    this.fixedColCanvas = document.getElementById(fixedCol);
    this.ctxFixedRow = this.fixedRowCanvas.getContext("2d");
    this.ctxFixedCol = this.fixedColCanvas.getContext("2d");
    this.graph = document.getElementById("graphDiv");
    this.cellInput = document.getElementById(cellInput);
    this.innerCanvasContainer = document.querySelector(".innerCanvasContainer");

    /**
     *  @type {number}
     */
    this.RESIZE_HANDLE_WIDTH = 5;
    /**
     *  @type {number}
     */
    this.scrollTop = 0;
    /**
     *  @type {number}
     */
    this.scrollLeft = 0;
    /**
     *  @type {number}
     */
    this.ROWS = 1000;
    /**
     *  @type {number}
     */
    this.COLS = 50;
    /**
     *  @type {number[]}
     */
    this.columnWidths = Array(this.COLS).fill(100);
    /**
     *  @type {number[]}
     */
    this.rowHeights = Array(this.ROWS).fill(30);

    /**
     *  @type {number[][]}
     */
    this.data = Array(this.ROWS)
      .fill()
      .map(() => Array(this.COLS).fill(""));

    /**
     * @type {boolean}
     */
    this.isColResizing = false;
    /**
     * @type {boolean}
     */
    this.isRowResizing = false;
    /**
     *  @type {number}
     */
    this.resizingColumn = -1;
    /**
     *  @type {number}
     */
    this.COLUMN_WIDTH = this.columnWidths[0];
    /**
     *  @type {number}
     */
    this.CELL_HEIGHT = this.rowHeights[0];
    /**
     *  @type {number}
     */
    this.resizingRow = -1;
    /**
     *  @type {cell[]}
     */
    this.selectedCells = [];
    /**
     * @type {boolean};
     */
    this.isSelecting = false;
    /**
     * @type {startCell};
     */
    this.startCell = null;
    this.copiedData = []

    this.maxValue = document.querySelector(".max-value");
    this.minValue = document.querySelector(".min-value");
    this.avgValue = document.querySelector(".avg-value");
    this.sumValue = document.querySelector(".sum-value");
    this.cntValue = document.querySelector(".cnt-value");
    /**
     *  @type {number}
     */
    this.currentHeight = this.canvas.height;
    /**
     *  @type {number}
     */
    this.currentWidth = this.canvas.width;
    /**
     *  @type {number}
     */
    this.currentRows = 0;
    /**
     *  @type {number}
     */
    this.currentCols = 0;
    /**
     *  @type {boolean}
     */
    this.isGraphDivVisible = false;
    /**
     *  @type {string[]}
     */
    this.dataForGraph = [];
    /**
     *  @type {number[]}
     */
    this.colForGraph = [];
    this.scrollY = 0;
    this.scrollX = 0;

    this.isShiftPressed = false;
    this.init();
  }
  /**
   * @returns {void}
   */
  async init() {
    document
      .getElementById("fileInput")
      .addEventListener("change", this.handleFileUpload.bind(this));
    await this.fetchContent();
    document
      .getElementById("deleteRowBtn")
      .addEventListener("click", this.deleteRow.bind(this));
    document
      .getElementById("replaceBtn")
      .addEventListener("click", this.handleReplace.bind(this));
    document
      .getElementById("graphBtn")
      .addEventListener("click", this.handleGraph.bind(this));
    document
      .getElementById("barGraphBtn")
      .addEventListener("click", this.barGraph.bind(this));
    document
      .getElementById("lineGraphBtn")
      .addEventListener("click", this.lineGraph.bind(this));
    document
      .getElementById("pieGraphBtn")
      .addEventListener("click", this.pieGraph.bind(this));

    this.fixedRowCanvas.addEventListener(
      "click",
      this.fixedRowCanvasClick.bind(this)
    );
    this.fixedColCanvas.addEventListener(
      "click",
      this.fixedColCanvasClick.bind(this)
    );
    this.fixedRowCanvas.addEventListener(
      "mousedown",
      this.mouseDownResize.bind(this)
    );
    this.fixedRowCanvas.addEventListener(
      "mousemove",
      this.mouseMoveResize.bind(this)
    );
    this.fixedRowCanvas.addEventListener(
      "mouseup",
      this.mouseUpResize.bind(this)
    );
    this.fixedColCanvas.addEventListener(
      "mousedown",
      this.mouseDownResize.bind(this)
    );
    this.fixedColCanvas.addEventListener(
      "mousemove",
      this.mouseMoveResize.bind(this)
    );
    this.fixedColCanvas.addEventListener(
      "mouseup",
      this.mouseUpResize.bind(this)
    );
    this.canvas.addEventListener("mousedown", this.mouseDownResize.bind(this));
    this.canvas.addEventListener("mousemove", this.mouseMoveResize.bind(this));
    this.canvas.addEventListener("mouseup", this.mouseUpResize.bind(this));
    this.canvas.addEventListener("dblclick", this.doubleClick.bind(this));
    document.addEventListener("wheel", this.handleScroll.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    // document.addEventListener("keyup", this.handleShiftRelease.bind(this));
  }
  /**
   * @param {number} id
   * @return {void} --> rendering data on frontend
   */
  async fetchContent(id = 0) {
    try {
      const res = await fetch(`http://localhost:5294/api/TodoItems?id=${id}`);
      if (!res.ok) {
        throw new Error("Bad Response!");
      }
      const jsonData = await res.json();

      const rows = jsonData.map((item) => Object.values(item));

      if (rows.length){
        this.ROWS += rows.length;
        this.COLS = rows[0].length;
        this.data = rows;
      } 
      this.render();
    } catch (error) {
      console.error("Failed to fetch: ", error);
    }
  }
  /**
   * @returns {void} --> for retaining pixel ratio on zoom
   */
  handlePixelRatio(canvas, ctx) {
    const pixelRatio = window.devicePixelRatio || 1;

    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    canvas.width = width;
    canvas.height = height;
    ctx.scale(pixelRatio, pixelRatio);
  }
  /**
   * @return {void} --> deleting rows
   */
  async deleteRow() {
    let firstRow = prompt("Enter the first row number");
    let secondRow = prompt("Enter the last row number");
    if (!firstRow || !secondRow) {
      alert("Please enter valid row numbers.");
      return;
    }
    try {
      const FromRowIndex = parseInt(firstRow, 10);
      const ToRowIndex = parseInt(secondRow, 10);
      if (
        isNaN(FromRowIndex) ||
        isNaN(ToRowIndex) ||
        FromRowIndex > ToRowIndex
      ) {
        alert("Invalid row numbers. Please enter valid numbers.");
        return;
      }
      const url = `http://localhost:5294/api/TodoItems?FromRowIndex=${FromRowIndex}&ToRowIndex=${ToRowIndex}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      // Handle the response
      if (res.status === 204) {
        alert("Rows deleted successfully!");
        await this.fetchContent();
      } else if (res.status === 404) {
        alert("No rows found for the given range.");
      } else {
        throw new Error("Failed to delete rows");
      }
    } catch (error) {
      console.error("Error deleting the records: ", error);
      alert("An error occured while deleting the rows")
    }
  }
  /**
   * @return {void} --> top row
   */
  fixedRow() {
    this.ctxFixedRow.clearRect(0, 0, this.fixedRowCanvas.width, this.fixedRowCanvas.height);
    // Set styles 
    this.ctxFixedRow.strokeStyle = "black";
    this.ctxFixedRow.lineWidth = 0.2;

    let x = -this.scrollX;

    for (let j = 0; j < 19; j++) {
        const columnWidth = this.columnWidths[j];
        
        // Draw the grid line
        this.ctxFixedRow.beginPath();
        this.ctxFixedRow.moveTo(x, 0);
        this.ctxFixedRow.lineTo(x, this.CELL_HEIGHT);
        this.ctxFixedRow.stroke();

        // Fill the cell background
        this.ctxFixedRow.fillStyle = "lightgray";
        this.ctxFixedRow.fillRect(x, 0, columnWidth, this.CELL_HEIGHT);

        // Set text color and draw text
        this.ctxFixedRow.fillStyle = "black";
        const colName = j === 0 ? "A" : this.getColName(j);
        this.ctxFixedRow.fillText(colName, x + 5, this.CELL_HEIGHT / 2);

        x += columnWidth;
    }
  }
  /**
   * @return {void} --> rightmost col
   */
  drawFixedCol() {
    this.ctxFixedCol.clearRect(0, 0, this.fixedColCanvas.width, this.fixedColCanvas.height);

    // Set styles
    this.ctxFixedCol.strokeStyle = "black";
    this.ctxFixedCol.lineWidth = 0.3;
    let y = 0;
    for (let i = 0; i < this.ROWS; i++) {
        const rowHeight = this.rowHeights[i + this.currentRows];

        // Draw the grid line
        this.ctxFixedCol.beginPath();
        this.ctxFixedCol.moveTo(0, y);
        this.ctxFixedCol.lineTo(this.fixedColCanvas.width, y);
        this.ctxFixedCol.stroke();

        // Fill the cell background
        this.ctxFixedCol.fillStyle = "lightgrey";
        this.ctxFixedCol.fillRect(0, y, this.fixedColCanvas.width, rowHeight);
        this.ctxFixedCol.fillText(i + 1, 5, y + this.CELL_HEIGHT / 2);
        this.ctxFixedCol.fillStyle = "gray";
        
        y += rowHeight;
    }
  }
  /**
   * @param {number} n
   * @returns {number} --> for column characters A,B,C...
   */
  getColName(n) {
    let columnName = "";
    while (n > 0) {
      let remainder = n % 26;
      columnName = String.fromCharCode(65 + remainder) + columnName;
      n = Math.floor(n / 26);
    }
    return columnName;
  }
  /**
   * @param {MouseEvent} e
   * @returns {void} --> selection of whole col
   */
  fixedRowCanvasClick(e) {
    const rect = this.fixedRowCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const col = this.getColumnAtX(x);
    if (col !== -1 && col < this.COLS) {
      this.ctxFixedRow.clearRect(
        0,
        0,
        this.fixedRowCanvas.width,
        this.fixedRowCanvas.height
      );
      this.fixedRow();
      this.selectColumn(col);
    }
  }
  /**
   * @param {number} col
   * @returns {void} --> selection of whole col
   */
  selectColumn(col) {
    this.selectedCells = [];
    for (let row = 0; row < this.ROWS; row++) {
      this.selectedCells.push({
        row,
        col,
        dataAtRowAndCol: this.data[this.currentRows][col],
      });
    }
    this.highlightSelection();
  }
  /**
   * @param {MouseEvent} e
   * @returns {void} --> selection of whole row
   */
  fixedColCanvasClick(e) {
    const rect = this.fixedColCanvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const row = this.getRowAtY(y);

    if (row !== -1 && row < this.ROWS) {
      this.ctxFixedCol.clearRect(
        0,
        0,
        this.fixedRowCanvas.width,
        this.fixedColCanvas.height
      );
      this.drawFixedCol();
      this.fixedRow();
      this.selectRow(row);
    }
  }
  /**
   * @param {number} row
   * @returns {void} --> selection of whole row
   */
  selectRow(row) {
    this.selectedCells = [];
    for (let col = 0; col < this.COLS; col++) {
      this.selectedCells.push({
        row,
        col,
        dataAtRowAndCol: this.data[row][col],
      });
    }
    this.highlightSelection();
  }
  /**
   * @returns {void} --> drawing of grid
   */
  drawGrid() {
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 0.2;

    let x = -this.scrollX;
    for (let j = 0; j <= 18; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();

      if (j < 18) x += this.columnWidths[j];
    }

    let y = 0;
    for (let i = this.currentRows; i <= this.ROWS; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(20 * 100, y);
      this.ctx.stroke();
      if (i < this.ROWS) y += this.rowHeights[i];
    }
  }
  /**
   * @param {boolean[]} filteredData
   * @returns {void}
   */
  drawCellContents(filteredData) {
    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#000";

    let y = 0;
    for (let i = 0; i < this.ROWS; i++) {
      if (filteredData[i]) {
        let x = -this.scrollX;
        for (let j = 0; j < this.COLS - 1; j++) {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.rect(x,y - this.CELL_HEIGHT / 2,this.columnWidths[j] - 10,this.rowHeights[i] + 10);
          this.ctx.clip();
          if (this.data[i] && this.data[i][j] !== undefined) {
            this.ctx.fillText(this.data[i][j], x + 5, y + this.CELL_HEIGHT / 2);
          }
          this.ctx.restore();
          x += this.columnWidths[j];
        }
        y += this.rowHeights[i + this.currentRows];
      }
    }
  }
  /**
   * @returns {void} --> to detect the shift key press
   */
  handleKeyDown(e) {
    if (e.ctrlKey) {
      e.preventDefault()
      if(e.key == "c" || e.key == "C"){
        this.copyPaste("copy");
      }else if(e.key == "v" || e.key == "V"){
        this.copyPaste("paste");
      }
    }
  }
  /**
   * @param {MouseEvent} e
   * @returns {void} --> for handling infinite scrolling
   */
  handleScroll(e) {
    if (!this.isShiftPressed) {
      this.scrollY += e.deltaY;
      this.scrollY = Math.max(0, this.scrollY);

      let temp = 0;
      for (let i = 0; i < this.rowHeights.length; i++) {
        temp += this.rowHeights[i];

        if (temp > this.scrollY) {
          this.currentRows = i;

          if (this.data.length - this.currentRows <= 100) {
            this.fetchContent(i);
            this.render();
            this.appendRowsOrColumns();
          }
          break;
        }
      }
    }
    if (this.isShiftPressed) {
      this.scrollX += e.deltaY;
      this.scrollX = Math.max(0, this.scrollX);

      let temp2 = 0;
      for (let i = 0; i < this.columnWidths.length; i++) {
        temp2 += this.columnWidths[i];
        if (temp2 > this.scrollX) {
          this.currentCols = i;

          if (this.data[0].length - this.currentCols <= 15) {
            this.appendRowsOrColumns();
          }
          break;
        }
      }
    }
    this.render();
  }
  /**
   * @returns {void} --> for adding rows and columns
   */
  appendRowsOrColumns() {
    if (!this.isShiftPressed) {
      let rowsToAdd = 500;
      this.ROWS += rowsToAdd;
      while (rowsToAdd > 0) {
        this.data.push(new Array());
        for (let j = 0; j < this.COLS; j++) {
          this.data[this.data.length - 1].push("");
        }
        this.rowHeights.push(30);
        rowsToAdd--;
      }
    } else {
      let colsToAdd = 50;
      this.COLS += colsToAdd;
      while (colsToAdd > 0) {
        this.data.push(new Array());
        for (let i = 0; i < this.ROWS; i++) {
          this.data[this.data[0].length - 1].push("");
        }
        this.columnWidths.push(100);
        colsToAdd--;
      }
    }
  }
  /**
   * @param {boolean[]} filteredData
   * @returns {void}
   */
  render(filteredData = this.data.map(() => true)) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.fixedRow();
    this.drawFixedCol();
    this.drawCellContents(filteredData);
  }
  /**
   *
   * @param {FileReaderEventMap} event
   * @returns {void} --> for handling and displaying csv data
   */
  async handleFileUpload(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("http://localhost:5294/api/TodoItems/uploadCsvData", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`Error: ${res.status} - ${res.statusText}`);
        }
        const data = await res.json();
        console.log(data);
        this.fetchContent();
    } catch (err) {
        console.error('File upload failed:', err.message || err);
        alert('File upload failed. Please try again.');
    }
  }
  /**
   * @param {number} x
   * @returns {number} --> to get the col at X coordinate
   */
  getColumnAtX(x) {
    let accumulatedWidth = -this.scrollX;
    for (let i = 0; i < this.COLS; i++) {
      accumulatedWidth += this.columnWidths[i];
      if (x < accumulatedWidth) return i;
    }
    return -1;
  }
  /**
   * @param {number} col
   * @returns {number} --> to get the col no from left
   */
  getColumnLeftPosition(col) {
    let x = -this.scrollX;
    for (let i = 0; i < col; i++) {
      x += this.columnWidths[i];
    }
    return x;
  }
  /**
   * @param {number} y
   * @returns {number} --> to get the col at X coordinate
   */
  getRowAtY(y) {
    let accumulatedWidth = 0;
    for (let i = 0; i < this.ROWS; i++) {
      accumulatedWidth += this.rowHeights[i + this.currentRows];
      if (y < accumulatedWidth) return i;
    }
    return -1;
  }
  /**
   * @param {number} row
   * @returns {number} --> to get the col no from left
   */
  getRowTopPosition(row) {
    let y = 0;
    for (let i = 0; i < row; i++) {
      y += this.rowHeights[i + this.currentRows];
    }
    return y;
  }
  /**
   * @param {MouseEvent} e
   * @returns {void} --> for col, row resizing and selection
   */
  mouseDownResize(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = this.getColumnAtX(x);
    const row = this.getRowAtY(y);


    //for col resizing
    if (y <= 0) {
      this.isColResizing = true;
      this.resizingColumn = col - 1;
      this.fixedRowCanvas.style.cursor = "ew-resize";
    }
    //for row resizing
    if (x <= 0) {
      this.isRowResizing = true;
      this.resizingRow = row - 1;
      this.fixedColCanvas.style.cursor = "ns-resize";
    }

    this.canvas.addEventListener("mouseup", () => {
      return;
    });

    //for selection
    this.ctxFixedRow.clearRect(0,0,this.fixedRowCanvas.width,this.fixedRowCanvas.height);
    this.ctxFixedCol.clearRect(0,0,this.fixedColCanvas.width,this.fixedColCanvas.height);
    let dataAtRowAndCol = this.data[row][col];
    this.startCell = { row, col, dataAtRowAndCol };
    this.selectedCells = [this.startCell];
    this.isSelecting = true;

    //for graph
    this.isGraphDivVisible = false;
    this.graph.style.display = "none";
    this.dataForGraph = [];
    this.colForGraph = [];

    this.drawFixedCol();
    this.fixedRow();
    this.highlightSelection();
  }
  /**
   * @param {MouseEvent} e
   * @returns {void} --> for col, row resizing and selection
   */
  mouseMoveResize(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // for col resizing
    if (this.isColResizing) {
      const newWidth = x - this.getColumnLeftPosition(this.resizingColumn);
      if (newWidth > 10) {
        this.columnWidths[this.resizingColumn] = newWidth;
        this.render();
      }
    } else {
      const col = this.getColumnAtX(x);
        const isHoveringResizeHandle = col > 0 && Math.abs(x - this.getColumnLeftPosition(col)) < this.RESIZE_HANDLE_WIDTH / 2;
        this.fixedRowCanvas.style.cursor = isHoveringResizeHandle ? "ew-resize" : "default";
    }

    // for row resizing
    if (this.isRowResizing) {
      const newHeight = y - this.getRowTopPosition(this.resizingRow);
      if (newHeight > 10) {
        this.rowHeights[this.resizingRow + this.currentRows] = newHeight;
        this.render();
      }
    } else {
      const row = this.getRowAtY(y);
        const isHoveringRowResizeHandle = row > 0 && Math.abs(y - this.getRowTopPosition(row)) < this.RESIZE_HANDLE_WIDTH / 2;
        this.fixedColCanvas.style.cursor = isHoveringRowResizeHandle ? "ns-resize" : "default";
    }
    //for selection
    if (!this.isSelecting) return;

    const col = this.getColumnAtX(x);
    const row = this.getRowAtY(y);
    let dataAtRowAndCol = this.data[row][col];
    const cell = { row, col, dataAtRowAndCol };

    this.selectedCells = this.getSelectedCells(this.startCell, cell);
    this.drawFixedCol();
    this.fixedRow();
    this.highlightSelection();
  }
  /**
   * @param {MouseEvent} e
   * @returns {void} --> for col, row resizing and selection
   */
  mouseUpResize(e) {
    this.isColResizing = false;
    this.isRowResizing = false;
    this.resizingColumn = -1;
    this.resizingRow = -1;
    this.canvas.style.cursor = "cell";

    //for selection
    this.isSelecting = false;
    const dataAtRowAndColArray = this.selectedCells.map(
      (obj) => obj.dataAtRowAndCol
    );
    if (dataAtRowAndColArray.length > 0) {
      const minimum = Math.min(...dataAtRowAndColArray);
      const maximum = Math.max(...dataAtRowAndColArray);
      let sum = 0;
      for (let i = 0; i < dataAtRowAndColArray.length; i++) {
        sum += parseFloat(dataAtRowAndColArray[i]);
      }
      const avg = sum / dataAtRowAndColArray.length;
      const count = dataAtRowAndColArray.length;

      this.minValue.textContent = `Min: ${minimum}`;
      this.maxValue.textContent = `Max: ${maximum}`;
      this.avgValue.textContent = `Avg: ${avg.toFixed(2)}`;
      this.sumValue.textContent = `Sum: ${sum}`;
      this.cntValue.textContent = `Cell count: ${count}`;
    }
    this.getDataforGraph();
    console.log(this.selectedCells);
    

  }
  /**
   * @param {MouseEvent} e
   * @returns {void} --> double click for input
   */
  doubleClick(e) {
    if (!this.isColResizing && !this.isRowResizing) {
      const rect = this.canvas.getBoundingClientRect();
      const containerRect = this.innerCanvasContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = this.getColumnAtX(x);
      const row = this.getRowAtY(y);
      if (col !== -1 && row < this.ROWS) {
        this.cellInput.style.display = "block";
        this.cellInput.style.left = `${
          rect.left + this.getColumnLeftPosition(col) - containerRect.left
        }px`;
        this.cellInput.style.top = `${
          rect.top + this.getRowTopPosition(row) - containerRect.top
        }px`;
        this.cellInput.style.width = `${this.columnWidths[col] - 8}px`;
        this.cellInput.style.height = `${
          this.rowHeights[row + this.currentRows] - 5
        }px`;
        if (this.data[row][col]) this.cellInput.value = this.data[row][col];
        this.cellInput.focus();

        this.cellInput.onblur = async () => {
          const updatedValue = this.cellInput.value;
          this.data[row][col] = updatedValue;
          this.cellInput.style.display = "none";
          this.render();

          const employeeRecord = {
            EmailId: String(this.data[row][0]),
            Name: String(this.data[row][1]),
            Country: String(this.data[row][2]),
            State: String(this.data[row][3]),
            City: String(this.data[row][4]),
            TelephoneNumber: String(this.data[row][5]),
            AddressLine1: String(this.data[row][6]),
            AddressLine2: String(this.data[row][7]),
            DateOfBirth: String(this.data[row][8]),
            GrossSalaryFY2019_20: String(this.data[row][9]),
            GrossSalaryFY2020_21: String(this.data[row][10]),
            GrossSalaryFY2021_22: String(this.data[row][11]),
            GrossSalaryFY2022_23: String(this.data[row][12]),
            GrossSalaryFY2023_24: String(this.data[row][13]),
            RowIndex: this.data[row][14],
          };

          try {
            const res = await fetch(`http://localhost:5294/api/TodoItems`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(employeeRecord),
            });
            if (!res.ok) {
              throw new Error("Failed to update data");
            }
            console.log("data updated successfully!");
          } catch (error) {
            console.error("Error updating the record: ", error);
          }
        };
      }
    }
  }
  /**
   * @param {selectedCells} start
   * @param {selectedCells} end
   * @returns {number[]} --> for storing cell coordinate on mousemove
   */
  getSelectedCells(start, end) {
    const selected = [];
    const startRow = Math.min(start.row, end.row);
    const endRow = Math.max(start.row, end.row);
    const startCol = Math.min(start.col, end.col);
    const endCol = Math.max(start.col, end.col);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        let dataAtRowAndCol = this.data[row][col];
        selected.push({ row, col, dataAtRowAndCol });
      }
    }
    return selected;
  }
  /**
   * @returns {void} --> for highlighting cells
   */
  highlightSelection() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();

    if (this.selectedCells.length === 0) return;

    const firstCell = this.selectedCells[0];
    const highlightColor = "rgba(0, 128, 0, 0.1)";
    const borderColor = "rgba(0, 128, 0, 0.8)";
    const fixedHighlightColor = "rgba(0, 140, 0, 0.05)";
    
    // Highlight the first selected cell
    this.ctx.fillStyle = "white";
    if (this.selectedCells.length === 1) {
        this.fillCell(firstCell, this.ctx, this.columnWidths[firstCell.col], this.CELL_HEIGHT);
    }

    // Highlight the rest of the selected cells
    this.ctx.fillStyle = highlightColor;
    this.selectedCells.slice(1).forEach(cell => {
        this.fillCell(cell, this.ctx, this.columnWidths[cell.col], this.rowHeights[cell.row + this.currentRows]);
    });

    // Draw border around the selection
    this.drawSelectionBorder();

    // Highlight in fixed row and column
    this.ctxFixedRow.fillStyle = fixedHighlightColor;
    this.selectedCells.forEach(cell => {
        this.fillCell(cell, this.ctxFixedRow, this.columnWidths[cell.col], this.CELL_HEIGHT, true);
    });

    this.ctxFixedCol.fillStyle = fixedHighlightColor;
    this.selectedCells.forEach(cell => {
        this.fillCell(cell, this.ctxFixedCol, this.columnWidths[0], this.rowHeights[cell.row + this.currentRows], false, true);
    });

    this.drawCellContents(this.data.map(() => true));
  }
  /**
   * @returns {void} --> for highlighting cells
   */
  fillCell(cell, context, width, height, isFixedRow = false, isFixedCol = false) {
    const x = this.getColumnLeftPosition(cell.col);
    const y = this.getRowTopPosition(cell.row);

    if (isFixedRow) {
        context.fillRect(x, 0, width, height);
    } else if (isFixedCol) {
        context.fillRect(0, y, width, height);
    } else {
        context.fillRect(x, y, width, height);
    }
  }
  /**
   * @returns {void} --> for border
   */
  drawSelectionBorder() {
    if (this.selectedCells.length > 0) {
      const minRow = Math.min(...this.selectedCells.map((cell) => cell.row));
      const maxRow = Math.max(...this.selectedCells.map((cell) => cell.row));
      const minCol = Math.min(...this.selectedCells.map((cell) => cell.col));
      const maxCol = Math.max(...this.selectedCells.map((cell) => cell.col));

      const xStart = this.getColumnLeftPosition(minCol);
      let yStart = 0;
      for (let x = 0; x < minRow; ++x) {
        yStart += this.rowHeights[x + this.currentRows];
      }
      const xEnd =
        this.getColumnLeftPosition(maxCol) + this.columnWidths[maxCol];
      let yWidth = 0;
      for (let x = minRow; x <= maxRow; ++x) {
        yWidth += this.rowHeights[x + this.currentRows];
      }
      this.ctx.strokeStyle = "rgba(0, 128, 0, 0.8)";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(xStart, yStart, xEnd - xStart, yWidth);
    }

    //fixed row1
    this.ctxFixedRow.fillStyle = "rgb(0, 140, 0, 0.05)";
    this.selectedCells.forEach((cell) => {
      const x = this.getColumnLeftPosition(cell.col);
      this.ctxFixedRow.fillRect(x, 0, this.columnWidths[cell.col], this.CELL_HEIGHT
      );
    });

    //fixed col
    this.ctxFixedCol.fillStyle = "rgb(0, 140, 0, 0.05)";
    this.selectedCells.forEach((cell) => {
      const y = this.getRowTopPosition(cell.row);
      this.ctxFixedCol.fillRect(0,y,this.columnWidths[0],this.rowHeights[cell.row + this.currentRows]);
    });
  }

  async copyToClipboard(text) {
    await navigator.clipboard.writeText(text).then(
      () => {
        console.log('Text copied to clipboard successfully!');
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  }
    /**
   * @param {start of range} startcell
   * @param {end of range} endcell
   * @param {pressed key} x
   */
  async copyPaste(action){
    if(action == "copy"){
      this.copiedData = this.selectedCells;
      this.copyToClipboardString = "";
    }
    else{
      for(var cell in this.copiedData){
        let row = this.startCell.row + this.copiedData[cell].row - this.copiedData[0].row;
        let col  = this.startCell.col + this.copiedData[cell].col - this.copiedData[0].col;
        this.data[row][col] = this.copiedData[cell].dataAtRowAndCol;

        const employeeRecord = {
          EmailId: String(this.data[row][0]),
          Name: String(this.data[row][1]),
          Country: String(this.data[row][2]),
          State: String(this.data[row][3]),
          City: String(this.data[row][4]),
          TelephoneNumber: String(this.data[row][5]),
          AddressLine1: String(this.data[row][6]),
          AddressLine2: String(this.data[row][7]),
          DateOfBirth: String(this.data[row][8]),
          GrossSalaryFY2019_20: String(this.data[row][9]),
          GrossSalaryFY2020_21: String(this.data[row][10]),
          GrossSalaryFY2021_22: String(this.data[row][11]),
          GrossSalaryFY2022_23: String(this.data[row][12]),
          GrossSalaryFY2023_24: String(this.data[row][13]),
          RowIndex: this.data[row][14],
        };

        try {
          const res = await fetch(`http://localhost:5294/api/TodoItems`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(employeeRecord),
          });
          if (!res.ok) {
            throw new Error("Failed to update data");
          }
        } catch (error) {
          console.error("Error updating the record: ", error);
        }
      }
      // alert("data updated successfully!");
      this.render();
    }
  }
  /**
   * @returns {void} --> for handling replace operation
   */
  async handleReplace() {
    let searchInput = document
      .querySelector("#searchInput")
      .value.toLowerCase();
    let replaceInput = document.querySelector("#replaceInput").value;

    if (searchInput === "") return;

    const replaceRequest = {
      SearchInput: searchInput,
      ReplaceInput: replaceInput,
    };

    // API call
    try {
      const res = await fetch(`http://localhost:5294/api/TodoItems/batch`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(replaceRequest),
      });
      if (!res.ok) {
        throw new Error("Failed to update data");
      }
      console.log("checking");
    } catch (error) {
      console.error("Error updating the records: ", error);
    }

    this.render();
    alert("Data replaced successfully!");
  }
  /**
   * @returns {void} --> for displaying graph
   */
  handleGraph() {
    let graphDiv = document.querySelector(".graphBtns");
    this.isGraphDivVisible = !this.isGraphDivVisible;
    if (this.isGraphDivVisible) {
      graphDiv.style.display = "flex";
      setTimeout(() => {
        graphDiv.style.opacity = "1";
      }, 10);
    } else {
      graphDiv.style.opacity = "0";
      graphDiv.addEventListener(
        "transitionend",
        () => {
          if (!this.isGraphDivVisible) {
            graphDiv.style.display = "none";
          }
        },
        { once: true }
      );
    }
  }
  /**
   * @returns {void} --> passing data for graph
   */
  getDataforGraph() {
    for (let i = 0; i < this.selectedCells.length; ++i) {
      this.dataForGraph.push(this.selectedCells[i].dataAtRowAndCol);
      this.colForGraph.push(i);
    }
  }
  /**
   * @returns {void} --> for bar graph
   */
  barGraph() {
    if (!this.graphInstance) {
      this.graphInstance = new graph(
        "graph",
        this.dataForGraph,
        this.colForGraph
      );
    } else {
      this.graphInstance.setData(this.dataForGraph, this.colForGraph);
    }

    this.showGraph();
    this.graphInstance.drawBarGraph();
  }
  /**
   * @returns {void} --> for line graph
   */
  lineGraph() {
    if (!this.graphInstance) {
      this.graphInstance = new graph(
        "graph",
        this.dataForGraph,
        this.colForGraph
      );
    } else {
      this.graphInstance.setData(this.dataForGraph, this.colForGraph);
    }

    this.showGraph();
    this.graphInstance.drawLineGraph();
  }
  /**
   * @returns {void} --> for pie graph
   */
  pieGraph() {
    if (!this.graphInstance) {
      this.graphInstance = new graph(
        "graph",
        this.dataForGraph,
        this.colForGraph
      );
    } else {
      this.graphInstance.setData(this.dataForGraph, this.colForGraph);
    }

    this.showGraph();
    this.graphInstance.drawPieGraph();
  }
  /**
   * @returns {void} --> for visibility of graph
   */
  showGraph() {
    this.isGraphDivVisible = true;
    if (this.isGraphDivVisible) {
      this.graph.style.display = "block";
      this.graph.style.position = "absolute";
    }
  }
}
