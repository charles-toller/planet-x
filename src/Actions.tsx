import * as React from 'react';
import {useCallback, useState} from 'react';
import {
    Button,
    ButtonGroup,
    Card, CardHeader,
    Chip, FormControl, InputLabel, MenuItem,
    Paper, Select, SelectChangeEvent, Table, TableBody, TableCell,
    TableContainer, TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup
} from "@mui/material";
import {
    AsteroidIcon, BotIcon,
    CometIcon,
    DwarfPlanetIcon,
    EmptySectorIcon,
    GasCloudIcon,
    PlanetXIcon,
    TargetIcon, TheoryIcon
} from "./Icons";
import {Abc, RestartAlt, WifiFindTwoTone} from "@mui/icons-material";
import {ConferenceKey, Game, ObjectType} from "./Game";
import {getNObjectsName, is, researchLookup, researchName} from "./Research";
import {useRecoilState, useRecoilValue} from "recoil";
import {availableSectors, sectorClamp, sectorState, theoriesState, TheoryObj} from "./atoms";
import {tableActions} from "./tables";
import produce from "immer";

type ActionType = "survey" | "target" | "research" | "locatePlanetX" | "theories" | "resetGame";

interface ActionsProps {
    resetGame: () => unknown;
    game: Game;
}
export function Actions(props: ActionsProps) {
    const [selected, setSelected] = useState<ActionType | null>("survey");
    const handleChange = useCallback((event: React.MouseEvent<HTMLElement>, newSelected: ActionType | null) => {
        setSelected(newSelected);
    }, []);
    const sector = useRecoilValue(sectorState);
    return (
        <Card sx={{marginBottom: "20px", padding: "0 0 20px 0"}}>
            <CardHeader title={`Sectors ${sector}-${sectorClamp(sector + 8)}`}/>
            <ToggleButtonGroup value={selected} exclusive onChange={handleChange}>
                <ToggleButton value="survey"><WifiFindTwoTone sx={{mr: 1}} /> Survey</ToggleButton>
                <ToggleButton value="target"><TargetIcon sx={{mr: 1}} /> Target</ToggleButton>
                <ToggleButton value="research"><Abc sx={{mr: 1}} /> Research</ToggleButton>
                <ToggleButton value="locatePlanetX"><PlanetXIcon sx={{mr: 1}} /> Locate Planet X</ToggleButton>
                <ToggleButton value="theories"><TheoryIcon sx={{mr: 1}} /> Theories</ToggleButton>
                <ToggleButton value="resetGame"><RestartAlt sx={{mr: 1}} /> Reset Game</ToggleButton>
            </ToggleButtonGroup>
            <div>
                {selected === "resetGame" && <ResetGame resetGame={props.resetGame} />}
                {selected === "survey" && <Survey game={props.game}/>}
                {selected === "research" && <Research game={props.game} />}
                {selected === "target" && <Target game={props.game} />}
                {selected === "theories" && <Theories game={props.game} />}
            </div>
        </Card>
    );
}

const objectTypeToIcon: {[key in ObjectType]: React.FunctionComponent} = {
    [ObjectType.PLANET_X]: PlanetXIcon,
    [ObjectType.COMET]: CometIcon,
    [ObjectType.EMPTY]: EmptySectorIcon,
    [ObjectType.GAS_CLOUD]: GasCloudIcon,
    [ObjectType.DWARF_PLANET]: DwarfPlanetIcon,
    [ObjectType.ASTEROID]: AsteroidIcon,
    [ObjectType.BOT]: BotIcon,
};

interface CustomSelectProps<T> {
    value: T;
    onChange: (newValue: T) => unknown;
}

function SectorSelect(props: CustomSelectProps<number | null>) {
    const onChange = useCallback((event: SelectChangeEvent) => {
        props.onChange(event.target.value === "" ? null : Number(event.target.value));
    }, [props.onChange]);
    return (
        <FormControl sx={{minWidth: 120}}>
            <InputLabel>Sector</InputLabel>
            <Select value={props.value === null ? "" : String(props.value)} onChange={onChange} label="Sector">
                <MenuItem value=""><em>None</em></MenuItem>
                {new Array(18).fill(0).map((_, i) => (
                    <MenuItem value={i + 1}>{i + 1}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

function TheorySelect(props: CustomSelectProps<ObjectType | null> & {bot: boolean}) {
    const onChange = useCallback((event: SelectChangeEvent) => {
        props.onChange(event.target.value === "" ? null : Number(event.target.value));
    }, [props.onChange]);
    return (
        <FormControl sx={{minWidth: 60}}>
            <InputLabel><TheoryIcon /></InputLabel>
            <Select label="Sector" value={props.value === null ? "" : String(props.value)} onChange={onChange}>
                <MenuItem value={ObjectType.GAS_CLOUD}><GasCloudIcon fontSize="inherit" /></MenuItem>
                <MenuItem value={ObjectType.DWARF_PLANET}><DwarfPlanetIcon fontSize="inherit" /></MenuItem>
                <MenuItem value={ObjectType.ASTEROID}><AsteroidIcon fontSize="inherit" /></MenuItem>
                <MenuItem value={ObjectType.COMET}><CometIcon fontSize="inherit" /></MenuItem>
                {props.bot && <MenuItem value={ObjectType.BOT}><BotIcon fontSize="inherit" /></MenuItem>}
            </Select>
        </FormControl>
    )
}

interface WorkingTheories {
    self: [number, ObjectType | null][];
    p2: [number, ObjectType | null][];
    p3: [number, ObjectType | null][];
    p4: [number, ObjectType | null][];
}

const initialWorkingTheories: WorkingTheories = {
    self: [],
    p2: [],
    p3: [],
    p4: [],
};

function Theories(props: Pick<ActionsProps, 'game'>) {
    const [theories, setTheories] = useRecoilState(theoriesState);
    const [newTheories, setNewTheories] = useState<WorkingTheories>(initialWorkingTheories);
    const submitTheories = useCallback(() => {
        setTheories(produce((draft) => {
            const newTheoryObj = {
                self: newTheories.self.filter((theory) => !theory.includes(null)) as [number, ObjectType][],
                p2: newTheories.p2.filter((theory) => !theory.includes(null)) as [number, ObjectType][],
                p3: newTheories.p3.filter((theory) => !theory.includes(null)) as [number, ObjectType][],
                p4: newTheories.p4.filter((theory) => !theory.includes(null)) as [number, ObjectType][],
                isChecked: false,
            } satisfies TheoryObj;
            draft.push(newTheoryObj);
            const checkIdx = draft.length - 3;
            if (checkIdx >= 0) {
                draft[checkIdx].isChecked = true;
                draft[checkIdx].p2 = draft[checkIdx].p2.map(([sector, type]) => type === ObjectType.BOT ? [sector, props.game.obj[sector]] : [sector, type]);
                draft[checkIdx].p3 = draft[checkIdx].p3.map(([sector, type]) => type === ObjectType.BOT ? [sector, props.game.obj[sector]] : [sector, type]);
                draft[checkIdx].p4 = draft[checkIdx].p4.map(([sector, type]) => type === ObjectType.BOT ? [sector, props.game.obj[sector]] : [sector, type]);
            }
        }));
        setNewTheories(initialWorkingTheories);
    }, [setTheories, newTheories]);
    return (
        <div>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Theory</TableCell>
                            <TableCell>Player 2</TableCell>
                            <TableCell>Player 3</TableCell>
                            <TableCell>Player 4</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {theories.map((row) => (
                            <TableRow>
                                {(["self", "p2", "p3", "p4"] as const).map((key) => (
                                    <TableCell>
                                        {row[key].map((theory) => {
                                            const SectorIcon = objectTypeToIcon[theory[1]];
                                            const color = row.isChecked ? props.game.obj[theory[0]] === theory[1] ? "success" : "error" : undefined;
                                            return (
                                                <Chip label={theory[0]} icon={<SectorIcon />} color={color} />
                                            );
                                        })}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        <TableRow>
                            {(["self", "p2", "p3", "p4"] as const).map((key) => (
                                <TableCell>
                                    {[0, 1].map((idx) => {
                                        return (
                                            <div>
                                                <SectorSelect value={newTheories[key][idx]?.[0] ?? null} onChange={(value) => {
                                                    setNewTheories((produce((draft) => {
                                                        if (value !== null) {
                                                            draft[key][idx] = [value, null]
                                                        } else {
                                                            draft[key] = draft[key].slice(0, idx);
                                                        }
                                                    })))
                                                }} />
                                                <TheorySelect value={newTheories[key][idx]?.[1] ?? null} onChange={(value) => {
                                                    setNewTheories((produce((draft) => {
                                                        draft[key][idx] = [draft[key][idx]?.[0] ?? 1, value]
                                                    })))
                                                }} bot={key !== "self"}/>
                                            </div>
                                        )
                                    })}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Button onClick={submitTheories}>Submit Theories</Button>
        </div>
    )
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