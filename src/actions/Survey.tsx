import * as React from "react";
import {useCallback, useState} from "react";
import {ObjectType} from "../Game";
import {useRecoilValue} from "recoil";
import {getNObjectsName, is, researchName} from "../Research";
import {Button, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {AsteroidIcon, CometIcon, DwarfPlanetIcon, EmptySectorIcon, GasCloudIcon} from "../Icons";
import {ActionsProps} from "./Actions";
import {tableActions} from "../tableState";
import {useSelector} from "react-redux";
import {availableSectorsSelector} from "../store/playerSectorPosition";

export const sectorCountToTime: number[] = [4, 4, 4, 4, 3, 3, 3, 2, 2, 2];

export function Survey(props: Pick<ActionsProps, 'game'>) {
    const [selectedType, setSelectedType] = useState<ObjectType | null>(ObjectType.ASTEROID);
    const sectorArray = useSelector(availableSectorsSelector);
    const handleTypeChange = useCallback((event: React.MouseEvent<HTMLElement>, newSelected: ObjectType | null) => {
        setSelectedType(newSelected);
    }, []);
    const [sectorRange, setSectors] = useState<number[]>([]);
    const handleSectorsChange = useCallback((event: React.MouseEvent<HTMLElement>, newSelected: number[]) => {
        if (newSelected.length === 0) {
            setSectors([]);
        } else if (sectorRange.length === 0) {
            setSectors(newSelected);
        } else if (sectorRange.length === 1 && newSelected.length === 2) {
            const lowIdx = Math.min(...sectorRange.map((a) => sectorArray.indexOf(a)), ...newSelected.map((a) => sectorArray.indexOf(a)));
            const highIdx = Math.max(...sectorRange.map((a) => sectorArray.indexOf(a)), ...newSelected.map((a) => sectorArray.indexOf(a)));
            setSectors(new Array(highIdx - lowIdx + 1).fill(0).map((_, i) => sectorArray[i + lowIdx]));
        } else if (sectorRange.length > 1) {
            const newSelect = newSelected.filter((a) => !sectorRange.includes(a));
            const unNewSelect = sectorRange.filter((a) => !newSelected.includes(a));
            setSectors([[...newSelect, ...unNewSelect][0]]);
        }
    }, [sectorRange, setSectors]);
    const [result, setResult] = useState<string | null>(null);
    const {setAction} = useRecoilValue(tableActions);
    const onSubmit = useCallback(() => {
        const count = Object.entries(props.game?.obj ?? {}).filter(([key, value]) => sectorRange.includes(Number(key)) && (selectedType === ObjectType.EMPTY ? value === ObjectType.EMPTY || value === ObjectType.PLANET_X : value === selectedType)).length;
        const min = sectorRange[0];
        const max = sectorRange[sectorRange.length - 1];
        setResult(`There ${is(count)} ${count} ${getNObjectsName(selectedType!, count)} in sectors ${min}-${max}.`);
        setAction(`${researchName([selectedType!], true)} ${min}-${max}`, String(count), sectorCountToTime[sectorRange.length]);
        setSectors([]);
    }, [props.game, selectedType, sectorRange]);
    return (
        <>
            <ToggleButtonGroup value={selectedType} exclusive onChange={handleTypeChange}>
                <ToggleButton value={ObjectType.ASTEROID}><AsteroidIcon/></ToggleButton>
                <ToggleButton value={ObjectType.DWARF_PLANET}><DwarfPlanetIcon/></ToggleButton>
                <ToggleButton value={ObjectType.COMET}><CometIcon/></ToggleButton>
                <ToggleButton value={ObjectType.GAS_CLOUD}><GasCloudIcon/></ToggleButton>
                <ToggleButton value={ObjectType.EMPTY}><EmptySectorIcon/></ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup value={sectorRange} onChange={handleSectorsChange}>
                {sectorArray.map((sectorNumber) => {
                    return (<ToggleButton key={sectorNumber} value={sectorNumber}>{sectorNumber}</ToggleButton>);
                })}
            </ToggleButtonGroup>
            <Button variant="outlined" onClick={onSubmit}>Submit</Button>
            {result && <p>{result}</p>}
        </>
    )
}