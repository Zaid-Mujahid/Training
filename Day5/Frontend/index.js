import { canvasGrid } from "./grid.js";

class sheet {
  constructor() {
    this.init();
    new canvasGrid(
      "myCanvas",
      ".canvasContainer",
      "fixedRow",
      "fixedCol",
      "cellInput",
    ).render();
  }
  init(){
    this.constructHtml()
  }
  constructHtml(){
    const main = document.createElement("main");

    //ribbon container
    const ribbon = document.createElement('div');
    ribbon.className = "ribbon";

    //File Section
    const uploadFile = document.createElement('div');
    uploadFile.className = "upload-file";
    const uploadLabel = document.createElement('label');
    uploadLabel.textContent = "Upload File:";
    const fileInput = document.createElement('input');
    fileInput.type = "file";
    fileInput.accept = ".csv";
    fileInput.id = "fileInput";
    uploadFile.appendChild(uploadLabel);
    uploadFile.appendChild(fileInput);

    //Delete Row Button
      const deleteRowBtn = document.createElement('button');
      deleteRowBtn.id = "deleteRowBtn";
      deleteRowBtn.textContent = "Delete Row";

    //Search Input
    const searchInput = document.createElement('input');
    searchInput.type = "search";
    searchInput.placeholder = "Find";
    searchInput.id = "searchInput";

    //Replace Input
    const replaceInput = document.createElement('input');
    replaceInput.type = "search";
    replaceInput.placeholder = "Replace";
    replaceInput.id = "replaceInput";

    //Replace Button
    const replaceBtn = document.createElement('button');
    replaceBtn.id = "replaceBtn";
    replaceBtn.textContent = "Replace";

    //Graph Button
    const graphBtn = document.createElement('button');
    graphBtn.id = "graphBtn";
    graphBtn.textContent = "Graph";

    //Graph Buttons Container
    const graphBtns = document.createElement('div');
    graphBtns.className = "graphBtns";

    const barGraphBtn = document.createElement('button');
    barGraphBtn.id = "barGraphBtn";
    barGraphBtn.textContent = "Bar";

    const lineGraphBtn = document.createElement('button');
    lineGraphBtn.id = "lineGraphBtn";
    lineGraphBtn.textContent = "Line";

    const pieGraphBtn = document.createElement('button');
    pieGraphBtn.id = "pieGraphBtn";
    pieGraphBtn.textContent = "Pie";

    graphBtns.appendChild(barGraphBtn);
    graphBtns.appendChild(lineGraphBtn);
    graphBtns.appendChild(pieGraphBtn);

    //Append all ribbon elements
    ribbon.appendChild(uploadFile);
    ribbon.appendChild(searchInput);
    ribbon.appendChild(replaceInput);
    ribbon.appendChild(replaceBtn);
    ribbon.appendChild(deleteRowBtn);
    ribbon.appendChild(graphBtn);
    ribbon.appendChild(graphBtns);

    //Graph Div
    const graphDiv = document.createElement('div');
    graphDiv.id = "graphDiv";
    graphDiv.style = "height: 350px; width: 500px; display: none; top:25%; left:35%; z-index: 10;";
    const graphCanvas = document.createElement('canvas');
    graphCanvas.id = "graph";
    graphCanvas.style.backgroundColor = "white";
    graphDiv.appendChild(graphCanvas);

    //Canvas Container
    const canvasContainer = document.createElement('div');
    canvasContainer.className = "canvasContainer";
    canvasContainer.style.overflow = "auto";

    const fixedRow = document.createElement('canvas');
    fixedRow.id = "fixedRow";
    fixedRow.width = 1850;
    fixedRow.height = 30;

    const fixedCol = document.createElement('canvas');
    fixedCol.id = "fixedCol";
    fixedCol.width = 50;
    fixedCol.height = 800;

    const innerCanvasContainer = document.createElement('div');
    innerCanvasContainer.className = "innerCanvasContainer";

    const mainCanvas = document.createElement('canvas');
    mainCanvas.id = "myCanvas";
    mainCanvas.width = 1850;
    mainCanvas.height = 800;

    innerCanvasContainer.appendChild(mainCanvas);
    canvasContainer.appendChild(fixedRow);
    canvasContainer.appendChild(fixedCol);
    canvasContainer.appendChild(innerCanvasContainer);

    const cellInput = document.createElement('input');
    cellInput.type = "text";
    cellInput.id = "cellInput";
    cellInput.style = "display:none; position:absolute; outline-color:green; outline-style: solid; outline-width: 1px;";

    canvasContainer.appendChild(cellInput);

    //Status Bar
    const statusBar = document.createElement('div');
    statusBar.className = "status-bar";

    const cntValue = document.createElement('p');
    cntValue.className = "cnt-value";
    cntValue.textContent = "Cell count:";

    const sumValue = document.createElement('p');
    sumValue.className = "sum-value";
    sumValue.textContent = "Sum:";

    const maxValue = document.createElement('p');
    maxValue.className = "max-value";
    maxValue.textContent = "Max:";

    const minValue = document.createElement('p');
    minValue.className = "min-value";
    minValue.textContent = "Min:";

    const avgValue = document.createElement('p');
    avgValue.className = "avg-value";
    avgValue.textContent = "Avg:";

    statusBar.appendChild(cntValue);
    statusBar.appendChild(sumValue);
    statusBar.appendChild(maxValue);
    statusBar.appendChild(minValue);
    statusBar.appendChild(avgValue);

    //Append everything to the main element
    main.appendChild(ribbon);
    main.appendChild(graphDiv);
    main.appendChild(canvasContainer);
    main.appendChild(statusBar);

    //Append main to the body
    document.body.appendChild(main);
  }
}

new sheet()