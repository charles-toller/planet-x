import {Game, ObjectType, objectTypeStringToEnum} from "../Game";
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
import {TheoryObj} from "../atoms";
import produce from "immer";
import {titlePluralWords} from "../Research";
import {ActionsProps} from "./Actions";
import {useDispatch, useSelector} from "react-redux";
import {
    addFromWorkingTheoriesAction,
    addTheoriesAction,
    allowedSubmissionsSelector, invertAllowedTheories,
    legacyAddTheoriesAction,
    legacyTheoriesSelector,
    setTheoryTypeAction,
    theoriesSelector,
    verifyAllTheoriesAction,
    verifyTheoryAction
} from "../store/theories";
import {callNTimes, notNull} from "../util";
import {setWorkingTheoryObjectType, setWorkingTheorySector, workingTheories} from "../store/workingTheories";
import {guessTheoryFromMapSelector} from "../store/map";
import {ReduxGameState} from "../store/ReduxGameState";

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
                {!props.bot && <MenuItem value={ObjectType.GAS_CLOUD} disabled={props.prohibitedOptions?.includes(ObjectType.GAS_CLOUD) ?? false}><GasCloudIcon fontSize="inherit"/></MenuItem>}
                {!props.bot && <MenuItem value={ObjectType.DWARF_PLANET} disabled={props.prohibitedOptions?.includes(ObjectType.DWARF_PLANET) ?? false}><DwarfPlanetIcon fontSize="inherit"/></MenuItem>}
                {!props.bot && <MenuItem value={ObjectType.ASTEROID} disabled={props.prohibitedOptions?.includes(ObjectType.ASTEROID) ?? false}><AsteroidIcon fontSize="inherit"/></MenuItem>}
                {!props.bot && <MenuItem value={ObjectType.COMET} disabled={props.prohibitedOptions?.includes(ObjectType.COMET) ?? false}><CometIcon fontSize="inherit"/></MenuItem>}
                {props.bot && <MenuItem value={ObjectType.BOT}><BotIcon fontSize="inherit"/></MenuItem>}
                {props.bot && <MenuItem value={ObjectType.PLAYER}><Person fontSize="inherit"/></MenuItem>}
            </Select>
        </FormControl>
    )
}

function playerIdToName(id: number): "self" | "p2" | "p3" | "p4" {
    return (["self", "p2", "p3", "p4"] as const)[id] ?? (String(id) as never);
}

export function Theories() {
    const game = useSelector((state: ReduxGameState) => state.game.game);
    const {theories, playerCount} = useSelector(theoriesSelector);
    const newTheories = useSelector(workingTheories.selectSlice);
    const dispatch = useDispatch();
    const submitTheories = useCallback(() => {
        dispatch(addFromWorkingTheoriesAction());
    }, [dispatch]);
    const verifyTheories = useCallback(() => {
        dispatch(verifyAllTheoriesAction());
    }, []);
    const guessedTheoryFromMap = useSelector(guessTheoryFromMapSelector);
    const setSector = useCallback((playerId: number, sector: number | null, theoryIdx: number) => {
        dispatch(setWorkingTheorySector({playerId, sector, theoryIdx}));
        if (sector != null && playerId === 0) {
            dispatch(setWorkingTheoryObjectType({playerId, theoryIdx, objectType: guessedTheoryFromMap[sector]}));
        }
    }, [dispatch, guessedTheoryFromMap]);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const handleRightClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        event.preventDefault();
    }, []);
    const onMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);
    const allowedSubmissions = useSelector(allowedSubmissionsSelector);
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
                    {theories.map((theoryRow, rowNumber) => <TableRow>
                        {theoryRow.map((playerTheories, playerId) => <TableCell>
                            {playerTheories.map((theory, theoryIndex) => {
                                const SectorIcon = objectTypeToIcon[theory.type];
                                let color: "error" | "success" | "primary" | undefined = undefined;
                                if (theory.verified) {
                                    if (theory.type === ObjectType.PLAYER) {
                                        color = "primary";
                                    } else if (game?.obj[theory.sector] === theory.type) {
                                        color = "success"
                                    } else {
                                        color = "error"
                                    }
                                }
                                return (
                                    <Chip data-theory={`${rowNumber},${playerId},${theoryIndex}`} onContextMenu={handleRightClick}
                                          label={theory.sector} icon={<SectorIcon/>} color={color}/>
                                );
                            })}
                        </TableCell>)}
                    </TableRow>)}
                    <TableRow>
                        {callNTimes(playerCount, (playerId) => <TableCell>
                            {callNTimes(2, (theoryIdx) => {
                                const newTheory = newTheories[playerId]?.[theoryIdx] ?? {
                                    sector: null,
                                    type: null
                                };
                                return (
                                    <div>
                                        <SectorSelect value={newTheory.sector} onChange={(value) => {
                                            setSector(playerId, value, theoryIdx);
                                        }} prohibitedOptions={allowedSubmissions.map((a, i) => a.length === 0 ? i + 1 : null).filter(notNull)} />
                                        <TheorySelect value={newTheory.type}
                                                      onChange={(value) => {
                                                          dispatch(setWorkingTheoryObjectType({playerId, objectType: value, theoryIdx}));
                                                      }} bot={playerId !== 0} prohibitedOptions={newTheory.sector == null ? [] : invertAllowedTheories(allowedSubmissions[newTheory.sector - 1])}/>
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
        {game && <TheoriesMenu anchorEl={anchorEl} onClose={onMenuClose} game={game} />}
    </div>
}

const fnLookup = {
    [ObjectType.GAS_CLOUD]: "setGas",
    [ObjectType.DWARF_PLANET]: "setDwarf",
    [ObjectType.ASTEROID]: "setAsteroid",
    [ObjectType.COMET]: "setComet",
} as const;

function TheoriesMenu({anchorEl, onClose, game}: {anchorEl: HTMLElement | null; onClose: () => unknown; game: Game}) {
    const theories = useSelector(legacyTheoriesSelector);
    const dispatch = useDispatch();
    const menuOpen = Boolean(anchorEl);
    const [menuRow, menuSection, menuTheory] = useMemo(() => {
        const data = anchorEl?.dataset['theory']?.split(",");
        if (data === undefined) return [undefined, undefined, undefined];
        return [Number(data[0]), playerIdToName(Number(data[1])), Number(data[2])];
    }, [anchorEl]);
    const menuTarget = useMemo(() => {
        if (menuRow == null || menuSection == null || menuTheory == null) return null;
        return theories[menuRow][menuSection][menuTheory];
    }, [menuRow, menuSection, menuTheory, theories]);
    const handleClose = useMemo(() => {
        const setType = (type: ObjectType) => {
            dispatch(setTheoryTypeAction({
                rowIndex: menuRow!,
                player: menuSection!,
                tIndex: menuTheory!,
                type,
            }));
            onClose();
        };
        return {
            "verify": () => {
                dispatch(verifyTheoryAction({rowIndex: menuRow!, tIndex: menuTheory!, player: menuSection!}));
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
    }, [onClose, anchorEl, game, dispatch]);
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