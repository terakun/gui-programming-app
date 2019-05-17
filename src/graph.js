// プログラムを表現するクラス
export default class Graph {
  constructor() {
    this.edges = [[],[]];
    this.start_node = 0;
    this.end_node = 1;
    this.nodes = ["Start", "End"];
    this.attributes = [{}, {}];
    this.nodes_num = this.edges.length;
  }

  addComponent(component) {
    this.edges.push([]);
    this.nodes.push(component);
    this.attributes.push({});
    this.nodes_num++;
    return this;
  }

  deleteEdge(from,to) {
    const idx = this.edges[from].findIndex(node => node === to);
    this.edges[from].splice(idx,1);
    return this;
  }

  deleteEdges(deletelist) {
    for(let [from,to] of deletelist){
      this.deleteEdge(from,to);
    }
    return this;
  }

  setAttribute(id, attr) {
    this.attributes[id] = attr;
    return this;
  }

  checkConnectStartToEnd() {
    let node = this.start_node;
    let stack = [node];
    let visited = new Array(this.nodes_num).fill(false);

    while (stack.length > 0) {
      let node = stack.pop();
      visited[node] = true;
      console.log(this.nodes[node]);
      if (node !== this.end_node) {
        if (((this.nodes[node] === "BranchDistSensor" || this.nodes[node] === "LineSensor" ) && this.edges[node].length < 2) ||
          ((this.nodes[node] !== "BranchDistSensor" && this.nodes[node] !== "LineSensor") && this.edges[node].length === 0)) {
          return false;
        }
      }
      for (let next_node of this.edges[node]) {
        if (!visited[next_node]) stack.push(next_node);
      }
    }
    return true;
  }

  addEdge(from, to) {
    console.log(from);
    console.log(to);
    this.edges[from].push(to);
    return this;
  }
}
