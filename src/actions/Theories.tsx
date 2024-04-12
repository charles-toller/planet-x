import {ObjectType} from "../Game";
import * as React from "react";
import {useCallback, useId, useMemo, useState} from "react";
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
import {researchName, singularWord, titlePluralWords} from "../Research";
import {useDispatch, useSelector} from "react-redux";
import {
    addFromWorkingTheoriesAction,
    allowedSubmissionsSelector,
    invertAllowedTheories,
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
    name: string;
}

function SectorSelect(props: CustomSelectProps<number | null>) {
    const onChange = useCallback((event: SelectChangeEvent) => {
        props.onChange(event.target.value === "" ? null : Number(event.target.value));
    }, [props.onChange]);
    const id = useId();
    return (
        <FormControl sx={{minWidth: 120}}>
            <InputLabel id={id} aria-label={props.name}>Sector</InputLabel>
            <Select value={props.value === null ? "" : String(props.value)} onChange={onChange} label="Sector" labelId={id}>
                <MenuItem value=""><em>None</em></MenuItem>
                {new Array(18).fill(0).map((_, i) => (
                    <MenuItem key={i} disabled={props.prohibitedOptions?.includes(i + 1) ?? false} value={i + 1}>{i + 1}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

function TheorySelect(props: CustomSelectProps<ObjectType | null> & { bot: boolean }) {
    const onChange = useCallback((event: SelectChangeEvent) => {
        props.onChange(event.target.value === "" ? null : Number(event.target.value));
    }, [props.onChange]);
    const id = useId();
    return (
        <FormControl sx={{minWidth: 60}}>
            <InputLabel id={id} aria-label={props.name}><TheoryIcon/></InputLabel>
            <Select labelId={id} label="Sector" value={props.value === null ? "" : String(props.value)} onChange={onChange}>
                {!props.bot && <MenuItem aria-label="Gas Cloud" value={ObjectType.GAS_CLOUD} disabled={props.prohibitedOptions?.includes(ObjectType.GAS_CLOUD) ?? false}><GasCloudIcon fontSize="inherit"/></MenuItem>}
                {!props.bot && <MenuItem aria-label="Dwarf Planet" value={ObjectType.DWARF_PLANET} disabled={props.prohibitedOptions?.includes(ObjectType.DWARF_PLANET) ?? false}><DwarfPlanetIcon fontSize="inherit"/></MenuItem>}
                {!props.bot && <MenuItem aria-label="Asteroid" value={ObjectType.ASTEROID} disabled={props.prohibitedOptions?.includes(ObjectType.ASTEROID) ?? false}><AsteroidIcon fontSize="inherit"/></MenuItem>}
                {!props.bot && <MenuItem aria-label="Comet" value={ObjectType.COMET} disabled={props.prohibitedOptions?.includes(ObjectType.COMET) ?? false}><CometIcon fontSize="inherit"/></MenuItem>}
                {props.bot && <MenuItem aria-label="Bot" value={ObjectType.BOT}><BotIcon fontSize="inherit"/></MenuItem>}
                {props.bot && <MenuItem aria-label="Player" value={ObjectType.PLAYER}><Person fontSize="inherit"/></MenuItem>}
            </Select>
        </FormControl>
    )
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
            dispatch(setWorkingTheoryObjectType({playerId, theoryIdx, objectType: guessedTheoryFromMap[sector - 1]}));
        } else if (sector != null) {
            dispatch(setWorkingTheoryObjectType({playerId, theoryIdx, objectType: ObjectType.PLAYER}));
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
                    {theories.map((theoryRow, rowNumber) => <TableRow key={rowNumber}>
                        {theoryRow.map((playerTheories, playerId) => <TableCell key={playerId}>
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
                                          label={theory.sector} icon={<SectorIcon/>} color={color} key={theoryIndex} aria-label={`Theory by Player ${playerId + 1}: Sector ${theory.sector} is a ${singularWord[theory.type]}`}/>
                                );
                            })}
                        </TableCell>)}
                    </TableRow>)}
                    <TableRow>
                        {callNTimes(playerCount, (playerId) => <TableCell key={playerId}>
                            {callNTimes(2, (theoryIdx) => {
                                const newTheory = newTheories[playerId]?.[theoryIdx] ?? {
                                    sector: null,
                                    type: null
                                };
                                return (
                                    <div key={theoryIdx}>
                                        <SectorSelect value={newTheory.sector} name={`Player ${playerId + 1} Theory ${theoryIdx + 1} Sector Select`} onChange={(value) => {
                                            setSector(playerId, value, theoryIdx);
                                        }} prohibitedOptions={playerId !== 0 ? [] : allowedSubmissions.map((a, i) => a.length === 0 ? i + 1 : null).filter(notNull)} />
                                        <TheorySelect value={newTheory.type} name={`Player ${playerId + 1} Theory ${theoryIdx + 1} Object Select`}
                                                      onChange={(value) => {
                                                          dispatch(setWorkingTheoryObjectType({playerId, objectType: value, theoryIdx}));
                                                      }} bot={playerId !== 0} prohibitedOptions={newTheory.sector == null || playerId !== 0 ? [] : invertAllowedTheories(allowedSubmissions[newTheory.sector - 1])}/>
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
        <TheoriesMenu anchorEl={anchorEl} onClose={onMenuClose} />
    </div>
}

const fnLookup = {
    [ObjectType.GAS_CLOUD]: "setGas",
    [ObjectType.DWARF_PLANET]: "setDwarf",
    [ObjectType.ASTEROID]: "setAsteroid",
    [ObjectType.COMET]: "setComet",
} as const;

function TheoriesMenu({anchorEl, onClose}: {anchorEl: HTMLElement | null; onClose: () => unknown}) {
    const {theories} = useSelector(theoriesSelector);
    const dispatch = useDispatch();
    const menuOpen = Boolean(anchorEl);
    const [menuRow, menuSection, menuTheory] = useMemo(() => {
        const data = anchorEl?.dataset['theory']?.split(",");
        if (data === undefined) return [undefined, undefined, undefined];
        return [Number(data[0]), Number(data[1]), Number(data[2])];
    }, [anchorEl]);
    const menuTarget = useMemo(() => {
        if (menuRow == null || menuSection == null || menuTheory == null) return null;
        return theories[menuRow][menuSection][menuTheory];
    }, [menuRow, menuSection, menuTheory, theories]);
    const handleClose = useMemo(() => {
        const setType = (type: ObjectType) => {
            onClose();
            dispatch(setTheoryTypeAction({
                rowIndex: menuRow!,
                playerId: menuSection!,
                tIndex: menuTheory!,
                type,
            }));
        };
        return {
            "verify": () => {
                dispatch(verifyTheoryAction({rowIndex: menuRow!, tIndex: menuTheory!, playerId: menuSection!}));
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
    }, [onClose, anchorEl, dispatch]);
    const [wasMenuOpen, setWasMenuOpen] = useState<boolean>(false);
    if (!wasMenuOpen && menuOpen) {
        setWasMenuOpen(true);
    }
    const children: Array<JSX.Element> = useMemo(() => {
        const arr: JSX.Element[] = [];
        if (menuSection !== 0) {
            arr.push(...([ObjectType.GAS_CLOUD, ObjectType.DWARF_PLANET, ObjectType.ASTEROID, ObjectType.COMET] as const).map((objectType) => {
                const IconType = objectTypeToIcon[objectType];
                return <MenuItem onClick={handleClose[fnLookup[objectType]]} key={objectType}>
                    <ListItemIcon>
                        <IconType fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>
                        Set {titlePluralWords[objectType]}
                    </ListItemText>
                </MenuItem>;
            }));
        }
        if (!menuTarget?.verified) {
            arr.push(<MenuItem onClick={handleClose["verify"]} key="verify">Verify</MenuItem>);
        }
        arr.push(<MenuItem onClick={handleClose["noAction"]} key="cancel">Cancel</MenuItem>);
        return arr;
    }, [menuOpen || wasMenuOpen]);
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