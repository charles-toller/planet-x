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

type ActionType = "survey" | "target" | "research" | "locatePlanetX" | "resetGame";

interface ActionsProps {
    resetGame: () => unknown;
    game: Game;
    setAction: (action: string, result: string) => unknown;
    setResearch: (researchKey: ConferenceKey, research: string) => unknown;
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
                {selected === "survey" && <Survey startSector={1} game={props.game} setAction={props.setAction} />}
                {selected === "research" && <Research game={props.game} setResearch={props.setResearch} />}
            </div>
        </Card>
    );
}

function Research(props: Pick<ActionsProps, 'game' | 'setResearch'>) {
    const research = useCallback((key: ConferenceKey) => {
        const info = props.game?.conf[key];
        if (info === undefined) return;
        props.setResearch(key, researchLookup[info.body.type](info.body as any) + ".");
    }, [props.setResearch, props.game]);
    return (
        <>
            <ButtonGroup orientation="vertical">
                {Object.entries(props.game?.conf ?? {}).map(([key, val]) => (
                    <Button variant="outlined" onClick={research.bind(null, key as ConferenceKey)}>{key}: {researchName(val.title)}</Button>
                ))}
            </ButtonGroup>
        </>
    )
}
function ResetGame(props: Pick<ActionsProps, 'resetGame'>) {
    return (
        <Button onClick={props.resetGame}>Reset Game</Button>
    )
}

function Survey(props: Pick<ActionsProps, 'game' | 'setAction'> & {startSector: number}) {
    const [selectedType, setSelectedType] = useState<ObjectType | null>(ObjectType.ASTEROID);
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
            const low = Math.min(...sectorRange, ...newSelected);
            const high = Math.max(...sectorRange, ...newSelected);
            setSectors(new Array(high - low + 1).fill(0).map((_, i) => low + i));
        }
        else if (sectorRange.length > 1) {
            const newSelect = newSelected.filter((a) => !sectorRange.includes(a));
            const unNewSelect = sectorRange.filter((a) => !newSelected.includes(a));
            setSectors([[...newSelect, ...unNewSelect][0]]);
        }
    }, [sectorRange, setSectors]);
    const [result, setResult] = useState<string | null>(null);
    const onSubmit = useCallback(() => {
        const count = Object.entries(props.game?.obj ?? {}).filter(([key, value]) => sectorRange.includes(Number(key)) && (selectedType === ObjectType.EMPTY ? value === ObjectType.EMPTY || value === ObjectType.PLANET_X : value === selectedType)).length;
        const min = sectorRange[0];
        const max = sectorRange[sectorRange.length - 1];
        setResult(`There ${is(count)} ${count} ${getNObjectsName(selectedType!, count)} in sectors ${min}-${max}.`);
        props.setAction(`${researchName([selectedType!], true)} ${min}-${max}`, String(count));
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
                {new Array(9).fill(null).map((_, i) => {
                    const n = i + props.startSector;
                    return (<ToggleButton key={n} value={n}>{n}</ToggleButton>);
                })}
            </ToggleButtonGroup>
            <Button variant="outlined" onClick={onSubmit}>Submit</Button>
            {result && <p>{result}</p>}
        </>
    )
}