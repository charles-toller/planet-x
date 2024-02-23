import {Game, ObjectType} from "../Game";
import * as React from "react";
import {useCallback, useMemo, useState} from "react";
import {
    Button,
    Chip,
    FormControl,
    InputLabel,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {AsteroidIcon, BotIcon, CometIcon, DwarfPlanetIcon, GasCloudIcon, objectTypeToIcon, TheoryIcon} from "../Icons";
import {Person} from "@mui/icons-material";
import {useRecoilState} from "recoil";
import {forwardVerifyTheories, theoriesState, theoryKeys, TheoryObj, verifyAllTheories} from "../atoms";
import produce from "immer";
import {titlePluralWords} from "../Research";
import {ActionsProps} from "./Actions";

interface CustomSelectProps<T> {
    value: T;
    onChange: (newValue: T) => unknown;
    prohibitedOptions?: T[];
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
                    <MenuItem disabled={props.prohibitedOptions?.includes(i + 1) ?? false} value={i + 1}>{i + 1}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

function TheorySelect(props: CustomSelectProps<ObjectType | null> & { bot: boolean }) {
    const onChange = useCallback((event: SelectChangeEvent) => {
        props.onChange(event.target.value === "" ? null : Number(event.target.value));
    }, [props.onChange]);
    return (
        <FormControl sx={{minWidth: 60}}>
            <InputLabel><TheoryIcon/></InputLabel>
            <Select label="Sector" value={props.value === null ? "" : String(props.value)} onChange={onChange}>
                {!props.bot && <MenuItem value={ObjectType.GAS_CLOUD}><GasCloudIcon fontSize="inherit"/></MenuItem>}
                {!props.bot && <MenuItem value={ObjectType.DWARF_PLANET}><DwarfPlanetIcon fontSize="inherit"/></MenuItem>}
                {!props.bot && <MenuItem value={ObjectType.ASTEROID}><AsteroidIcon fontSize="inherit"/></MenuItem>}
                {!props.bot && <MenuItem value={ObjectType.COMET}><CometIcon fontSize="inherit"/></MenuItem>}
                {props.bot && <MenuItem value={ObjectType.BOT}><BotIcon fontSize="inherit"/></MenuItem>}
                {props.bot && <MenuItem value={ObjectType.PLAYER}><Person fontSize="inherit"/></MenuItem>}
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

function produceTheoryFromInput(input: Array<[number, ObjectType | null]>): Array<[number, ObjectType, boolean]> {
    return input
        .filter((input): input is [number, ObjectType] => !input.includes(null))
        .map((input) => [...input, false]);
}

export function Theories(props: Pick<ActionsProps, 'game'>) {
    const [theories, setTheories] = useRecoilState(theoriesState);
    const [newTheories, setNewTheories] = useState<WorkingTheories>(initialWorkingTheories);
    const submitTheories = useCallback(() => {
        setTheories(produce((draft) => {
            const newTheoryObj = {
                self: produceTheoryFromInput(newTheories.self),
                p2: produceTheoryFromInput(newTheories.p2),
                p3: produceTheoryFromInput(newTheories.p3),
                p4: produceTheoryFromInput(newTheories.p4),
            } satisfies TheoryObj;
            draft.push(newTheoryObj);
            forwardVerifyTheories(props.game, draft);
        }));
        setNewTheories(initialWorkingTheories);
    }, [setTheories, newTheories, props.game]);
    const verifyTheories = useCallback(() => {
        setTheories(produce(verifyAllTheories));
    }, []);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const handleRightClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        event.preventDefault();
    }, []);
    const onMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);
    const verifiedSectors = useMemo(() => {
        return theories.flatMap((theoryRow) => {
            return theoryKeys.flatMap((key) => {
                return theoryRow[key].filter((theory) => theory[2] && props.game.obj[theory[0]] === theory[1]).map((theory) => theory[0]);
            });
        }).filter((a, i, arr) => arr.indexOf(a) === i);
    }, [theories]);
    return <div>
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
                    {theories.map((row, i) => <TableRow>
                            {theoryKeys.map((key) => <TableCell>
                                    {row[key].map((theory, j) => {
                                        const SectorIcon = objectTypeToIcon[theory[1]];
                                        let color: "error" | "success" | "primary" | undefined = undefined;
                                        if (theory[2]) {
                                            if (theory[1] === ObjectType.PLAYER) {
                                                color = "primary";
                                            } else if (props.game.obj[theory[0]] === theory[1]) {
                                                color = "success";
                                            } else {
                                                color = "error";
                                            }
                                        }
                                        return (
                                            <Chip data-theory={`${i},${key},${j}`} onContextMenu={handleRightClick}
                                                  label={theory[0]} icon={<SectorIcon/>} color={color}/>
                                        );
                                    })}
                                </TableCell>)}
                        </TableRow>)}
                    <TableRow>
                        {theoryKeys.map((key) => <TableCell>
                                {[0, 1].map((idx) => {
                                    return (
                                        <div>
                                            <SectorSelect value={newTheories[key][idx]?.[0] ?? null}
                                                          onChange={(value) => {
                                                              setNewTheories((produce((draft) => {
                                                                  if (value !== null) {
                                                                      draft[key][idx] = [value, null]
                                                                  } else {
                                                                      draft[key] = draft[key].slice(0, idx);
                                                                  }
                                                              })))
                                                          }} prohibitedOptions={verifiedSectors} />
                                            <TheorySelect value={newTheories[key][idx]?.[1] ?? null}
                                                          onChange={(value) => {
                                                              setNewTheories((produce((draft) => {
                                                                  draft[key][idx] = [draft[key][idx]?.[0] ?? 1, value]
                                                              })))
                                                          }} bot={key !== "self"}/>
                                        </div>
                                    )
                                })}
                            </TableCell>)}
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
        <Button onClick={submitTheories}>Submit Theories</Button>
        <Button onClick={verifyTheories}>Verify All Theories</Button>
        <TheoriesMenu anchorEl={anchorEl} onClose={onMenuClose} game={props.game} />
    </div>
}

const fnLookup = {
    [ObjectType.GAS_CLOUD]: "setGas",
    [ObjectType.DWARF_PLANET]: "setDwarf",
    [ObjectType.ASTEROID]: "setAsteroid",
    [ObjectType.COMET]: "setComet",
} as const;

function TheoriesMenu({anchorEl, onClose, game}: {anchorEl: HTMLElement | null; onClose: () => unknown; game: Game}) {
    const [theories, setTheories] = useRecoilState(theoriesState);
    const menuOpen = Boolean(anchorEl);
    const [menuRow, menuSection, menuTheory] = useMemo(() => {
        const data = anchorEl?.dataset['theory']?.split(",");
        if (data === undefined) return [undefined, undefined, undefined];
        return [Number(data[0]), data[1] as "self" | "p2" | "p3" | "p4", Number(data[2])];
    }, [anchorEl]);
    const menuTarget = useMemo(() => {
        if (menuRow == null || menuSection == null || menuTheory == null) return null;
        return theories[menuRow][menuSection][menuTheory];
    }, [menuRow, menuSection, menuTheory, theories]);
    const handleClose = useMemo(() => {
        const setType = (type: ObjectType) => {
            setTheories(produce((draft) => {
                const target = draft[menuRow!][menuSection!][menuTheory!];
                target[1] = type;
                forwardVerifyTheories(game, draft);
            }));
            onClose();
        };
        return {
            "verify": () => {
                setTheories(produce((draft) => {
                    const target = draft[menuRow!][menuSection!][menuTheory!];
                    target[2] = true;
                    forwardVerifyTheories(game, draft);
                }));
                onClose();
            },
            "setGas": setType.bind(null, ObjectType.GAS_CLOUD),
            "setDwarf": setType.bind(null, ObjectType.DWARF_PLANET),
            "setAsteroid": setType.bind(null, ObjectType.ASTEROID),
            "setComet": setType.bind(null, ObjectType.COMET),
            "noAction": () => {
                onClose();
            }
        };
    }, [onClose, anchorEl, game]);
    const [wasMenuOpen, setWasMenuOpen] = useState<boolean>(false);
    if (!wasMenuOpen && menuOpen) {
        setWasMenuOpen(true);
    }
    const children = useMemo(() => (
        <>
            {menuSection !== "self" && ([ObjectType.GAS_CLOUD, ObjectType.DWARF_PLANET, ObjectType.ASTEROID, ObjectType.COMET] as const).map((objectType) => {
                const IconType = objectTypeToIcon[objectType];
                return <MenuItem onClick={handleClose[fnLookup[objectType]]}>
                    <ListItemIcon>
                        <IconType fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>
                        Set {titlePluralWords[objectType]}
                    </ListItemText>
                </MenuItem>;
            })}
            {menuTarget?.[2] === false && <MenuItem onClick={handleClose["verify"]}>Verify</MenuItem>}
            <MenuItem onClick={handleClose["noAction"]}>Cancel</MenuItem>
        </>
    ), [menuOpen || wasMenuOpen]);
    return (
        <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleClose["noAction"]}
            MenuListProps={{
                'aria-labelledby': 'basic-button',
            }}
            TransitionProps={{
                onExited: () => {
                    setWasMenuOpen(false);
                }
            }}
        >
            {children}
        </Menu>
    )
}