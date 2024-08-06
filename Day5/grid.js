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
  constructor(
    myCanvas,
    canvasContainer,
    fixedRow,
    fixedCol,
    cellInput,
  ) {
    this.canvas = document.getElementById(myCanvas);
    this.ctx = this.canvas.getContext("2d");
    this.mainCanvasContainer = document.getElementById(canvasContainer);
    this.fixedRowCanvas = document.getElementById(fixedRow);
    this.fixedColCanvas = document.getElementById(fixedCol);
    this.ctxFixedRow = this.fixedRowCanvas.getContext("2d");
    this.ctxFixedCol = this.fixedColCanvas.getContext("2d");
    this.graph = document.getElementById("graphDiv");
    console.log(this.graph);
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
    this.ROWS = 100;
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
    this.currentRows = this.ROWS;
    /**
     *  @type {number}
     */
    this.currentCols = this.COLS;

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
    /**
     *  @type {boolean}
     */
    this.isCtrlPressed = false;
    // /**
    //  *  @type {number}
    //  */
    // this.marchingAntsOffset = 0; // Offset for marching ants animation
    // /**
    //  *  @type {?number}
    //  */
    // this.animationFrameId = null; // ID for the animation frame
    this.init();
  }
  /**
   * @returns {void}
   */
  init() {
    // window.addEventListener('resize', ()=>{
    //   this.handlePixelRatio(this.canvas, this.ctx)
    //   // this.handlePixelRatio(this.fixedColCanvas, this.ctxFixedCol)
    //   // this.handlePixelRatio(this.fixedRowCanvas, this.ctxFixedRow)
    //   this.render()
    // })
    document
      .getElementById("fileInput")
      .addEventListener("change", this.handleFileUplaod.bind(this));
    document
      .getElementById("deleteRowBtn")
      .addEventListener("click", this.deleteRow.bind(this));
    document
      .getElementById("updateRowBtn")
      .addEventListener("click", this.updateRow.bind(this));
    document
      .getElementById("searchInput")
      .addEventListener("change", this.handleSearch.bind(this));
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
    // document.addEventListener("keydown", this.handleKeyPress.bind(this));
    // document.addEventListener("keyup", this.handleKeyUp.bind(this));
    // document.addEventListener("scroll", this.infiniteScroll.bind(this));
  }
  /**
   * @returns {void} --> for retaining pixel ratio on zoom
   */
  // handlePixelRatio(canvas, ctx) {
  //   const pixelRatio = window.devicePixelRatio;

  //   const width = canvas.clientWidth * pixelRatio;
  //   const height = canvas.clientHeight * pixelRatio;
  //   canvas.width = width;
  //   canvas.height = height;
  //   ctx.scale(pixelRatio, pixelRatio);
  // }
  /**
   * @return {void} --> deleting rows
   */
  deleteRow() {
    if (this.ROWS > 0) {
      this.data.pop();
      this.ROWS--;
      this.render();
    }
  }
  /**
   * @return {void} --> updating rows
   */
  updateRow() {
    const rowIndex = prompt("Enter the row index to update:");
    if (rowIndex !== null && rowIndex >= 0 && rowIndex < this.ROWS) {
      const newRowData = prompt("Enter the new row data, separated by commas:");
      if (newRowData !== null) {
        const newRow = newRowData.split(",");
        if (newRow.length === this.COLS) {
          this.data[rowIndex] = newRow;
          this.render();
        } else {
          alert(`Invalid data. Expected ${this.COLS} columns.`);
        }
      }
    }
  }
  /**
   * @return {void} --> top row
   */
  fixedRow() {
    this.ctxFixedRow.strokeStyle = "black";
    this.ctxFixedRow.lineWidth = 0.2;
    this.ctxFixedRow.clearRect(
      0,
      0,
      this.fixedRowCanvas.width,
      this.fixedRowCanvas.height
    );
    let x = 0;
    for (let j = 0; j <= this.COLS; j++) {
      this.ctxFixedRow.beginPath();
      this.ctxFixedRow.moveTo(x, 0);
      this.ctxFixedRow.lineTo(x, this.CELL_HEIGHT);
      this.ctxFixedRow.stroke();
      this.ctxFixedRow.fillStyle = "lightgray";
      this.ctxFixedRow.fillRect(x, 0, this.columnWidths[j], this.CELL_HEIGHT);
      this.ctxFixedRow.fillStyle = "black";
      this.ctxFixedRow.fillText(
        String.fromCharCode(65 + j),
        x + 5,
        this.CELL_HEIGHT / 2
      );
      x += this.columnWidths[j];
    }
  }
  /**
   * @return {void} --> rightmost col
   */
  drawFixedCol() {
    this.ctxFixedCol.strokeStyle = "black";
    this.ctxFixedCol.lineWidth = 0.3;
    this.ctxFixedCol.clearRect(
      0,
      0,
      this.fixedColCanvas.width,
      this.fixedColCanvas.height
    );
    let y = 0;
    for (let i = 0; i < this.ROWS; i++) {
      this.ctxFixedCol.beginPath();
      this.ctxFixedCol.moveTo(0, y);
      this.ctxFixedCol.lineTo(this.fixedColCanvas.width, y);
      this.ctxFixedCol.stroke();
      this.ctxFixedCol.fillStyle = "lightgrey";
      this.ctxFixedCol.fillRect(
        0,
        y,
        this.fixedColCanvas.width,
        this.rowHeights[i]
      );
      this.ctxFixedCol.fillStyle = "black";
      this.ctxFixedCol.fillText(i + 1, 5, y + this.CELL_HEIGHT / 2);
      y += this.rowHeights[i];
    }
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
      this.drawFixedCol();
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
        dataAtRowAndCol: this.data[row][col],
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

    let x = 0;
    for (let j = 0; j <= this.COLS; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();

      if (j < this.COLS) x += this.columnWidths[j];
    }

    let y = 0;
    for (let i = 0; i <= this.ROWS; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.COLS * 100, y);
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
        let x = 0;
        for (let j = 0; j < this.COLS; j++) {
          if (this.data[i] && this.data[i][j] !== undefined) {
            this.ctx.fillText(this.data[i][j], x + 5, y + this.CELL_HEIGHT / 2);
          }
          x += this.columnWidths[j];
        }
        y += this.rowHeights[i];
      }
    }
  }
  /**
   * @param {boolean[]} filteredData
   * @returns {void}
   */
  render(filteredData = this.data.map(() => true)) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.fixedRow();
    this.drawFixedCol();
    this.drawGrid();
    this.drawCellContents(filteredData)
  }
  handleFileUplaod(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    console.log(reader);
    reader.onload = (e) => {
      const contents = e.target.result;
      const rows = contents.split("\n").map((row) => row.split(","));
      this.ROWS = rows.length;
      this.COLS = rows[0].length;
      this.data = rows;
      this.columnWidths = Array(this.COLS).fill(100);
      this.render();
    };
    reader.readAsText(file);
  }
  /**
   * @param {number} x
   * @returns {number} --> to get the col at X coordinate
   */
  getColumnAtX(x) {
    let accumulatedWidth = 0;
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
    let x = 0;
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
      accumulatedWidth += this.rowHeights[i];
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
      y += this.rowHeights[i];
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

    //for graph
    this.isGraphDivVisible = false;
    this.graph.style.display = "none"


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
    this.ctxFixedRow.clearRect(
      0,
      0,
      this.fixedRowCanvas.width,
      this.fixedRowCanvas.height
    );
    this.ctxFixedCol.clearRect(
      0,
      0,
      this.fixedColCanvas.width,
      this.fixedColCanvas.height
    );
    // const row = Math.floor(y / this.CELL_HEIGHT);
    let dataAtRowAndCol = this.data[row][col];
    this.startCell = { row, col, dataAtRowAndCol };
    this.selectedCells = [this.startCell];
    this.isSelecting = true;
    //for marching ants
    this.isCtrlPressed = false;
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
      if (
        col > 0 &&
        Math.abs(x - this.getColumnLeftPosition(col)) <
          this.RESIZE_HANDLE_WIDTH / 2
      ) {
        this.fixedRowCanvas.style.cursor = "ew-resize";
      } else {
        this.fixedRowCanvas.style.cursor = "default";
      }
    }

    // for row resizing
    if (this.isRowResizing) {
      const newHeight = y - this.getRowTopPosition(this.resizingRow);
      if (newHeight > 10) {
        this.rowHeights[this.resizingRow] = newHeight;
        this.render();
      }
    } else {
      const row = this.getRowAtY(y);
      if (
        row > 0 &&
        Math.abs(x - this.getRowTopPosition(row)) < this.RESIZE_HANDLE_WIDTH / 2
      ) {
        this.fixedColCanvas.style.cursor = "ns-resize";
      } else {
        this.fixedColCanvas.style.cursor = "default";
      }
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
    // this.canvas.removeEventListener("mousemove", this.mouseMoveSelection);
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
    this.selectedCells = [];
  }
  // /**
  //  * @param {KeyboardEvent} e
  //  * @returns {void} --> key down for marching ants
  //  */
  // handleKeyPress(e) {
  //   console.log(e);
  //   if (e.ctrlKey) {
  //     this.isCtrlPressed = true;
  //     console.log(this.isCtrlPressed);
  //     // this.startMarchingAnts(); // Start marching ants animation
  //   }
  // }
  // /**
  //  * @param {KeyboardEvent} e
  //  * @returns {void} --> key up for marching ants
  //  */
  // handleKeyUp(e) {
  //   if (e.key === "Control") {
  //     this.isCtrlPressed = false;
  //     this.stopMarchingAnts(); // Stop marching ants animation
  //   }
  // }
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
        this.cellInput.style.height = `${this.rowHeights[row] - 5}px`;
        this.cellInput.value = this.data[row][col];
        this.cellInput.focus();

        this.cellInput.onblur = () => {
          this.data[row][col] = this.cellInput.value;
          this.cellInput.style.display = "none";
          this.render();
        };
      }
    }
  }
  // /**
  //  * @returns {void} --> start marching ants animation
  //  */
  // startMarchingAnts() {
  //   const animate = () => {
  //     this.lineDashOffset = (this.lineDashOffset + 1) % 16; // speed calculation
  //     this.ctx.save();
  //     this.highlightSelection();
  //     this.ctx.restore();
  //     this.animationFrameId = requestAnimationFrame(animate);
  //   };
  //   this.animationFrameId = requestAnimationFrame(animate);
  // }
  // /**
  //  * @returns {void} --> stop marching ants animation
  //  */
  // stopMarchingAnts() {
  //   if (this.animationFrameId !== null) {
  //     cancelAnimationFrame(this.animationFrameId);
  //     this.animationFrameId = null;
  //     this.lineDashOffset = 0;
  //     this.highlightSelection(); // Redraw
  //   }
  // }
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
    this.drawCellContents(this.data.map(() => true));

    if (this.selectedCells.length === 0) {
      return;
    }
    if (this.selectedCells.length == 1) {
      this.ctx.fillStyle = "white";
      this.selectedCells.forEach((cell) => {
        const x = this.getColumnLeftPosition(cell.col);
        const y = this.getRowTopPosition(cell.row);
        this.ctx.fillRect(x, y, this.columnWidths[cell.col], this.CELL_HEIGHT);
      });
    }

    this.ctx.fillStyle = "rgb(0, 128, 0, 0.1)";
    this.selectedCells.slice(1).forEach((cell) => {
      const x = this.getColumnLeftPosition(cell.col);
      const y = this.getRowTopPosition(cell.row);
      this.ctx.fillRect(
        x,
        y,
        this.columnWidths[cell.col],
        this.rowHeights[cell.row]
      );
    });

    if (this.selectedCells.length > 0) {
      const minRow = Math.min(...this.selectedCells.map((cell) => cell.row));
      const maxRow = Math.max(...this.selectedCells.map((cell) => cell.row));
      const minCol = Math.min(...this.selectedCells.map((cell) => cell.col));
      const maxCol = Math.max(...this.selectedCells.map((cell) => cell.col));

      const xStart = this.getColumnLeftPosition(minCol);
      let yStart = 0;
      for (let x = 0; x < minRow; ++x) {
        yStart += this.rowHeights[x];
      }
      const xEnd =
        this.getColumnLeftPosition(maxCol) + this.columnWidths[maxCol];
      let yWidth = 0;
      for (let x = minRow; x <= maxRow; ++x) {
        yWidth += this.rowHeights[x];
      }

      // console.log(this.isCtrlPressed);
      // border
      this.ctx.save();
      if (this.isCtrlPressed) {
        console.log("inside if");
        this.ctx.setLineDash([8, 8]);
      } else {
        this.ctx.setLineDash([]);
      }  
      this.ctx.strokeStyle = "rgba(0, 128, 0, 0.8)";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(xStart, yStart, xEnd - xStart, yWidth);
      this.ctx.restore();
    }

    //fixed row1
    this.ctxFixedRow.fillStyle = "rgb(0, 140, 0, 0.05)";
    this.selectedCells.forEach((cell) => {
      const x = this.getColumnLeftPosition(cell.col);
      this.ctxFixedRow.fillRect(
        x,
        0,
        this.columnWidths[cell.col],
        this.CELL_HEIGHT
      );
    });

    //fixed col
    this.ctxFixedCol.fillStyle = "rgb(0, 140, 0, 0.05)";
    this.selectedCells.forEach((cell) => {
      const y = this.getRowTopPosition(cell.row);
      this.ctxFixedCol.fillRect(
        0,
        y,
        this.columnWidths[0],
        this.rowHeights[cell.row]
      );
    });
    this.drawCellContents(this.data.map(() => true));
  }
  handleSearch() {
    let input = document.querySelector("#searchInput").value.toLowerCase();
    let filteredData = this.data.map((row) =>
      row.some((cell) => cell.toString().toLowerCase().includes(input))
    );
    this.render(filteredData);
  }
  handleReplace() {
    let searchInput = document
      .querySelector("#searchInput")
      .value.toLowerCase();
    let replaceInput = document.querySelector("#replaceInput").value;

    if (searchInput === "") return;

    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        if (this.data[i][j].toString().toLowerCase().includes(searchInput)) {
          this.data[i][j] = this.data[i][j]
            .toString()
            .replace(new RegExp(searchInput, "gi"), replaceInput);
        }
      }
    }
    this.handleSearch();
    this.render();
    alert("data replaced successfully!");
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
      // console.log(this.selectedCells[i].dataAtRowAndCol);
      this.colForGraph.push(i);
    }
  }
  /**
   * @returns {void} --> for bar graph
   */
  // barGraph() {

  //   this.isGraphDivVisible = true;
  //   if(this.isGraphDivVisible){
  //     this.graph.style.display = "block"
  //     this.graph.style.position = "absolute"
  //   }
  //   if (this.isGraphDivVisible) {
  //     const barGraphObj = new graph(
  //       "graph",
  //       this.dataForGraph,
  //       this.colForGraph
  //     );
  //     barGraphObj.drawBarGraph();
  //   }
  // }
  // /**
  //  * @returns {void} --> for line graph
  //  */
  // lineGraph() {
  //   this.isGraphDivVisible = true;
  //   if(this.isGraphDivVisible){
  //     this.graph.style.display = "block"
  //     this.graph.style.position = "absolute"
  //   }
  //   if (this.isGraphDivVisible) {
  //     const lineGraphObj = new graph(
  //       "graph",
  //       this.dataForGraph,
  //       this.colForGraph
  //     );
  //     lineGraphObj.drawLineGraph();
  //   }
  // }
  // /**
  //  * @returns {void} --> for pie graph
  //  */
  // pieGraph() {
  //   this.isGraphDivVisible = true;
  //   if(this.isGraphDivVisible){
  //     this.graph.style.display = "block"
  //     this.graph.style.position = "absolute"
  //   }
  //   if (this.isGraphDivVisible) {
  //     const pieGraphObj = new graph(
  //       "graph",
  //       this.dataForGraph,
  //       this.colForGraph
  //     );
  //     pieGraphObj.drawPieGraph();
  //   }
  // }

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
  
  showGraph() {
    this.isGraphDivVisible = true;
    if (this.isGraphDivVisible) {
      this.graph.style.display = "block";
      this.graph.style.position = "absolute";
    }
  }
  
  // infiniteScroll(e) {
  //   const scrollHeight = this.canvas.scrollHeight;
  //   const clientHeight = this.canvas.clientHeight;
  //   const scrollTop = this.canvas.scrollTop;

  //   // const scrollWidth = document.documentElement.scrollWidth;
  //   // const clientWidth = document.documentElement.clientWidth;
  //   // const scrollLeft = document.documentElement.scrollLeft;

  //   if (scrollTop + clientHeight >= scrollHeight - 50) {
  //     // currentHeight += 100;
  //     // canvas.height = currentHeight;
  //     // fixedColCanvas.height = currentHeight;
  //     // currentRows += 30;
  //     // ROWS = currentRows;
  //     const newRows = 30;
  //     const newRowData = Array(newRows)
  //       .fill()
  //       .map(() => Array(this.COLS).fill(""));

  //     this.data = this.data.concat(newRowData);

  //     this.currentHeight += newRows * this.CELL_HEIGHT;
  //     this.canvas.height = this.currentHeight;
  //     this.fixedColCanvas.height = this.currentHeight;

  //     this.currentRows += newRows;
  //     this.ROWS = this.currentRows;
  //     this.render();
  //     // console.log(scrollWidth);
  //     // console.log(clientWidth);
  //     // console.log(scrollLeft);
  //     //   if(scrollLeft + clientWidth >= scrollWidth - 50){
  //     //     currentWidth += 500
  //     //     canvas.width = currentWidth;
  //     //     fixedRowCanvas.width = currentWidth;
  //     //     currentCols += 30;
  //     //     COLS = currentCols;
  //     //     fixedRow();
  //   }
  // }
}
