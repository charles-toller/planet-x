import * as React from 'react';
import {useCallback, useState} from 'react';
import {Button, ButtonGroup, Card, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {
    AsteroidIcon,
    CometIcon,
    DwarfPlanetIcon,
    EmptySectorIcon,
    GasCloudIcon,
    PlanetXIcon,
    TargetIcon
} from "./Icons";
import {Abc, RestartAlt, WifiFindTwoTone} from "@mui/icons-material";
import {ConferenceKey, Game, ObjectType} from "./Game";
import {getNObjectsName, is, researchLookup, researchName} from "./Research";
import {useRecoilValue} from "recoil";
import {availableSectors} from "./atoms";
import {tableActions} from "./tables";

type ActionType = "survey" | "target" | "research" | "locatePlanetX" | "resetGame";

interface ActionsProps {
    resetGame: () => unknown;
    game: Game;
}
export function Actions(props: ActionsProps) {
    const [selected, setSelected] = useState<ActionType | null>("survey");
    const handleChange = useCallback((event: React.MouseEvent<HTMLElement>, newSelected: ActionType | null) => {
        setSelected(newSelected);
    }, []);
    return (
        <Card sx={{marginBottom: "20px", padding: "20px"}}>
            <ToggleButtonGroup value={selected} exclusive onChange={handleChange}>
                <ToggleButton value="survey"><WifiFindTwoTone sx={{mr: 1}} /> Survey</ToggleButton>
                <ToggleButton value="target"><TargetIcon sx={{mr: 1}} /> Target</ToggleButton>
                <ToggleButton value="research"><Abc sx={{mr: 1}} /> Research</ToggleButton>
                <ToggleButton value="locatePlanetX"><PlanetXIcon sx={{mr: 1}} /> Locate Planet X</ToggleButton>
                <ToggleButton value="resetGame"><RestartAlt sx={{mr: 1}} /> Reset Game</ToggleButton>
            </ToggleButtonGroup>
            <div>
                {selected === "resetGame" && <ResetGame resetGame={props.resetGame} />}
                {selected === "survey" && <Survey game={props.game}/>}
                {selected === "research" && <Research game={props.game} />}
                {selected === "target" && <Target game={props.game} />}
            </div>
        </Card>
    );
}

function Research(props: Pick<ActionsProps, 'game'>) {
    const {setResearch, setAction} = useRecoilValue(tableActions);
    const research = useCallback((key: ConferenceKey) => {
        const info = props.game?.conf[key];
        if (info === undefined) return;
        setResearch(key, researchLookup[info.body.type](info.body as any) + ".");
        if (!key.startsWith("X")) {
            setAction(`Research ${key}`, "", 1);
        }
    }, [setResearch, props.game]);
    return (
        <>
            <ButtonGroup orientation="vertical">
                {Object.entries(props.game?.conf ?? {}).map(([key, val]) => (
                    <Button variant="outlined" onClick={research.bind(null, key as ConferenceKey)} key={key}>{key}: {researchName(val.title)}</Button>
                ))}
            </ButtonGroup>
        </>
    )
}
function ResetGame(props: Pick<ActionsProps, 'resetGame'>) {
    return (
        <Button onClick={props.resetGame}>Reset Game</Button>
    );
}

const sectorCountToTime: number[] = [4, 4, 4, 4, 3, 3, 3, 2, 2, 2];

function Survey(props: Pick<ActionsProps, 'game'>) {
    const [selectedType, setSelectedType] = useState<ObjectType | null>(ObjectType.ASTEROID);
    const sectorArray = useRecoilValue(availableSectors);
    const handleTypeChange = useCallback((event: React.MouseEvent<HTMLElement>, newSelected: ObjectType | null) => {
        setSelectedType(newSelected);
    }, []);
    const [sectorRange, setSectors] = useState<number[]>([]);
    const handleSectorsChange = useCallback((event: React.MouseEvent<HTMLElement>, newSelected: number[]) => {
        if (newSelected.length === 0) {
            setSectors([]);
        }
        else if (sectorRange.length === 0) {
            setSectors(newSelected);
        }
        else if (sectorRange.length === 1 && newSelected.length === 2) {
            const lowIdx = Math.min(...sectorRange.map((a) => sectorArray.indexOf(a)), ...newSelected.map((a) => sectorArray.indexOf(a)));
            const highIdx = Math.max(...sectorRange.map((a) => sectorArray.indexOf(a)), ...newSelected.map((a) => sectorArray.indexOf(a)));
            setSectors(new Array(highIdx - lowIdx + 1).fill(0).map((_, i) => sectorArray[i + lowIdx]));
        }
        else if (sectorRange.length > 1) {
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
                <ToggleButton value={ObjectType.ASTEROID}><AsteroidIcon /></ToggleButton>
                <ToggleButton value={ObjectType.DWARF_PLANET}><DwarfPlanetIcon /></ToggleButton>
                <ToggleButton value={ObjectType.COMET}><CometIcon /></ToggleButton>
                <ToggleButton value={ObjectType.GAS_CLOUD}><GasCloudIcon /></ToggleButton>
                <ToggleButton value={ObjectType.EMPTY}><EmptySectorIcon /></ToggleButton>
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

function Target(props: Pick<ActionsProps, 'game'>) {
    const [sector, setSector] = useState<number | null>(null);
    const sectorArray = useRecoilValue(availableSectors);
    const {setAction} = useRecoilValue(tableActions);
    const onSubmit = useCallback(() => {
        if (sector === null) return;
        const type = props.game.obj[sector];
        setAction(`T ${sector}`, researchName([type], true), 4);
        setSector(null);
    }, [props.game, sector]);
    return (
        <>
            <ToggleButtonGroup exclusive={true} value={sector} onChange={(_, newValue) => setSector(newValue)}>
                {sectorArray.map((sectorNumber) => {
                    return (<ToggleButton key={sectorNumber} value={sectorNumber}>{sectorNumber}</ToggleButton>);
                })}
            </ToggleButtonGroup>
            <Button variant="outlined" onClick={onSubmit}>Submit</Button>
        </>
    )
}