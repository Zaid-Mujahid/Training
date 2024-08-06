export class graph {
  constructor(GraphId, dataForGraph, colForGraph, showGraph) {
    this.showGraph = showGraph;
    this.dataForGraph = dataForGraph;
    this.colForGraph = colForGraph;
    this.graph = document.getElementById(GraphId);
    this.ctx = this.graph.getContext("2d")
  }
  drawBarGraph() {
    if(this.draw!= null) this.graph.destroy()
    this.draw = new Chart(this.ctx, {
      type: "bar",
      data: {
        labels: this.colForGraph,
        datasets: [
          {
            label: "",
            data: this.dataForGraph,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
  drawLineGraph() {
    if(this.draw!= null) this.graph.destroy()
    this.draw = new Chart(this.ctx, {
      type : 'line',
      data : {
        labels : this.colForGraph,
        datasets : [
            {
              data : this.dataForGraph,
              label : "",
              borderColor : "#3cba9f",
              fill : false
            }]
      },
      options : {
        title : {
          display : true,
        }
      }
    });
  }
  drawPieGraph(){
    if(this.draw!= null) this.graph.destroy()
    this.draw = new Chart(this.ctx, {
      type : 'pie',
      data : {
        labels : this.colForGraph,
        datasets : [ {
            data : this.dataForGraph,
            backgroundColor : [ "#51EAEA", "#FCDDB0",
              "#FF9D76", "#FB3569", "#82CD47" ],
            label : ""
        }]
      },
      options : {
        title : {
          display : true,
        }
      }
    });
  }
}
