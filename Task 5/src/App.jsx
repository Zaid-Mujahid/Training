import { useState } from "react";
import "./App.css";
import Ribbon from "./components/Ribbon/Ribbon";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  const [data, setData] = useState([
    { id: 1, name: "John Doe", age: 30 },
    { id: 2, name: "Jane Smith", age: 25 },
    { id: 2, name: "Jane Smith", age: 25 },
    { id: 2, name: "Jane Smith", age: 25 },
    { id: 2, name: "Jane Smith", age: 25 },
    { id: null,  name: "Jane Smith" },
  ]);
  return (
    <>
      <div className="App">
        <Ribbon />
        <Dashboard data={data} />
      </div>
    </>
  );
}

export default App;
