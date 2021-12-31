import React, {useEffect, useState} from 'react';
import './App.css';
import NoteWheel, {Sector} from "./NoteWheel";

const sectors: Sector[] = new Array(18).fill(null).map(() => ({
  x: [],
  o: []
}));

sectors[1].x.push("x", "e", "g", "d", "a");
sectors[1].o.push("c");

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <NoteWheel leftSector={1} isAdvanced={true} sectors={sectors} />
      </header>
    </div>
  );
}

export default App;
