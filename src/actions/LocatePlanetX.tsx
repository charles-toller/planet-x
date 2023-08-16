import * as React from "react";
import {useCallback, useState} from "react";
import {ObjectType} from "../Game";
import {sectorClamp} from "../atoms";
import {useRecoilValue} from "recoil";
import {
    Button,
    FormControl,
    InputLabel,
    ListItemIcon,
    MenuItem,
    Select,
    SelectChangeEvent,
    ToggleButton,
    ToggleButtonGroup
} from "@mui/material";
import {AsteroidIcon, CometIcon, EmptySectorIcon, GasCloudIcon, PlanetXIcon} from "../Icons";
import {ActionsProps} from "./Actions";
import {tableActions} from "../tableState";

function AdjacentSectorSelect({value, onUpdate, sectorNum}: {
    sectorNum: number;
    value: ObjectType | null;
    onUpdate: (newValue: ObjectType | null) => void
}) {
    const handleChange = useCallback((event: SelectChangeEvent) => {
        onUpdate(Number(event.target.value) as ObjectType);
    }, [onUpdate]);
    return (
        <FormControl>
            <InputLabel id="locate-x-left-label">Sector {sectorNum}</InputLabel>
            <Select sx={{minWidth: 110}} labelId="locate-x-left-label" id="locate-x-left"
                    value={value == null ? undefined : String(value)} label={`Sector ${sectorNum}`}
                    onChange={handleChange}>
                <MenuItem value={ObjectType.ASTEROID}>
                    <ListItemIcon>
                        <AsteroidIcon fontSize="small"/>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem value={ObjectType.COMET}>
                    <ListItemIcon>
                        <CometIcon fontSize="small"/>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem value={ObjectType.GAS_CLOUD}>
                    <ListItemIcon>
                        <GasCloudIcon fontSize="small"/>
                    </ListItemIcon>
                </MenuItem>
                <MenuItem value={ObjectType.EMPTY}>
                    <ListItemIcon>
                        <EmptySectorIcon fontSize="small"/>
                    </ListItemIcon>
                </MenuItem>
            </Select>
        </FormControl>
    )
}

export function LocatePlanetX(props: Pick<ActionsProps, 'game'>) {
    const [sectorData, setSectorData] = useState<{ left: number; x: number; right: number } | null>(null);
    const [leftObj, setLeftObj] = useState<ObjectType | null>(null);
    const [rightObj, setRightObj] = useState<ObjectType | null>(null);
    const handleSectorChange = useCallback((event: unknown, newSelected: number | null) => {
        setSectorData(newSelected == null ? null : {
            left: sectorClamp(newSelected - 1),
            x: newSelected,
            right: sectorClamp(newSelected + 1),
        });
    }, []);
    const [result, setResult] = useState<string>("");
    const {setAction} = useRecoilValue(tableActions);
    const submit = useCallback(() => {
        if (sectorData == null) return;
        if (props.game.obj[sectorData.x] !== ObjectType.PLANET_X || props.game.obj[sectorData.left] !== leftObj || props.game.obj[sectorData.right] !== rightObj) {
            setResult("At least one piece of information is incorrect.");
            setAction("Locate Planet X", "X", 5);
        } else {
            setResult("You have located Planet X!");
            setAction("Locate Planet X", "\u2713", 5);
        }
    }, [leftObj, rightObj, sectorData]);
    return (
        <>
            <div>
                <ToggleButtonGroup value={sectorData?.x} onChange={handleSectorChange} exclusive>
                    <ToggleButton value={""} disabled><PlanetXIcon color="info"/></ToggleButton>
                    {new Array(18).fill(0).map((_, i) => {
                        const sectorNumber = i + 1;
                        return (<ToggleButton key={sectorNumber} value={sectorNumber}>{sectorNumber}</ToggleButton>);
                    })}
                </ToggleButtonGroup>
            </div>
            {sectorData && <div style={{paddingTop: "10px"}}>
                <AdjacentSectorSelect sectorNum={sectorData.left} value={leftObj} onUpdate={setLeftObj}/>
                <AdjacentSectorSelect sectorNum={sectorData.right} value={rightObj} onUpdate={setRightObj}/>
            </div>}
            {Boolean(sectorData && leftObj != null && rightObj != null) && <div>
                <Button onClick={submit}>Submit</Button>
            </div>}
            {result && <div>{result}</div>}
        </>
    )
}