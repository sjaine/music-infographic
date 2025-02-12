import React from "react";
import TimelineChart from "./TimelineChart";

const App = () => {
  return (
    <div className="container">
      <div className="line_top"></div>
      <div className="line"></div>
      <div className="line_left"></div>
      <TimelineChart csvFile="/data/composureDetail.csv" eraFile="/data/era.csv" />
    </div>
  );
};

export default App;
