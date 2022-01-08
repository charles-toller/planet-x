import React, {useCallback, useState} from 'react';
import './App.css';
import NoteWheel, {Sector} from "./NoteWheel";
import {cometSectors, ObjectTypes, ObjId} from "./GameTypes";

const baseSectors: Sector[] = new Array(18).fill(null).map(() => ({
    x: [],
    o: []
}));

baseSectors[1].x.push("x", "e", "g", "d", "a");
baseSectors[1].o.push("c");

function App() {
    const [sectors, setSectors] = useState(baseSectors);
    const onObjectClick = useCallback((obj: ObjId) => {
        const sectorIndex = parseInt(obj.slice(1)) - 1;
        const objType = obj.slice(0, 1) as ObjectTypes;
        if (!sectors[sectorIndex].x.includes(objType) && !sectors[sectorIndex].o.includes(objType)) {
            const newSectors = [...sectors];
            newSectors[sectorIndex].x = [...newSectors[sectorIndex].x];
            newSectors[sectorIndex].x.push(objType);
            setSectors(newSectors);
        }
        else if (sectors[sectorIndex].x.includes(objType)) {
            const newSectors = [...sectors];
            newSectors[sectorIndex].x = [...newSectors[sectorIndex].x].filter((a) => a !== objType);
            newSectors[sectorIndex].o = [...newSectors[sectorIndex].o];
            newSectors[sectorIndex].o.push(objType);
            setSectors(newSectors);
        }
        else {
            const newSectors = [...sectors];
            newSectors[sectorIndex].o = [...newSectors[sectorIndex].o].filter((a) => a !== objType);
            setSectors(newSectors);
        }
    }, [sectors]);
    return (
        <div className="App">
            <div className="App-header">
                <NoteWheel leftSector={1} isAdvanced={true} sectors={sectors} onObjectClicked={onObjectClick}/>
                <div style={{width: "50%"}}>
                    <table>
                        <thead>
                        <tr>
                            <td>Action</td>
                            <td>Result</td>
                            <td>____</td>
                            <td>____</td>
                            <td>____</td>
                        </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default App;
