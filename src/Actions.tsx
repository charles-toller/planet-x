import * as React from 'react';
import {useCallback, useState} from 'react';
import {Button, Card, ToggleButton, ToggleButtonGroup} from "@mui/material";
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
import {Game, ObjectType} from "./Game";

type ActionType = "survey" | "target" | "research" | "locatePlanetX" | "resetGame";

interface ActionsProps {
    resetGame: () => unknown;
    game: Game | null;
}
export function Actions(props: ActionsProps) {
    const [selected, setSelected] = useState<ActionType | null>("survey");
    const handleChange = useCallback((event: React.MouseEvent<HTMLElement>, newSelected: ActionType | null) => {
        setSelected(newSelected);
    }, []);
    return (
        <Card>
            <ToggleButtonGroup value={selected} exclusive onChange={handleChange}>
                <ToggleButton value="survey"><WifiFindTwoTone sx={{mr: 1}} /> Survey</ToggleButton>
                <ToggleButton value="target"><TargetIcon sx={{mr: 1}} /> Target</ToggleButton>
                <ToggleButton value="research"><Abc sx={{mr: 1}} /> Research</ToggleButton>
                <ToggleButton value="locatePlanetX"><PlanetXIcon sx={{mr: 1}} /> Locate Planet X</ToggleButton>
                <ToggleButton value="resetGame"><RestartAlt sx={{mr: 1}} /> Reset Game</ToggleButton>
            </ToggleButtonGroup>
            <div>
                {selected === "resetGame" && <ResetGame resetGame={props.resetGame} />}
                {selected === "survey" && <Survey startSector={1} game={props.game} />}
            </div>
        </Card>
    );
}
function ResetGame(props: Pick<ActionsProps, 'resetGame'>) {
    return (
        <Button onClick={props.resetGame}>Reset Game</Button>
    )
}

type SurveyType = "asteroid" | "dwarfPlanet" | "comet" | "gasCloud" | "empty";
function Survey(props: {startSector: number; game: Game | null}) {
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
        setResult(`There are ${count} ${ObjectType[selectedType!]} in sectors ${sectorRange[0]}-${sectorRange[sectorRange.length - 1]}`);
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