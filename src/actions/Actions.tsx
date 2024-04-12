import * as React from 'react';
import {useCallback, useState} from 'react';
import {
    Button,
    Card,
    CardHeader,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead, TableRow,
    ToggleButton,
    ToggleButtonGroup
} from "@mui/material";
import {
    AsteroidIcon, BotIcon,
    CometIcon,
    DwarfPlanetIcon, FirstPlaceIcon,
    GasCloudIcon,
    PlanetXIcon,
    TargetIcon,
    TheoryIcon
} from "../Icons";
import {Abc, RestartAlt, WifiFindTwoTone} from "@mui/icons-material";
import {Game} from "../Game";
import {sectorClamp} from "../atoms";
import {Theories} from "./Theories";
import {Target} from "./Target";
import {Survey} from "./Survey";
import {Research} from "./Research";
import {LocatePlanetX} from "./LocatePlanetX";
import {ReactComponent as PlanetXScoreSvg} from "../assets/planetxscore.svg";
import {Bot} from "./Bot";
import {Sector} from "../NoteWheel";
import {useDispatch, useSelector} from "react-redux";
import {recoilSectorStateSelector} from "../store/playerSectorPosition";
import {verifyAllTheoriesAction} from "../store/theories";
import {scoreSelector} from "../store/scoreSelector";

type ActionType = "survey" | "target" | "research" | "locatePlanetX" | "theories" | "bot" | "resetGame";

export interface ActionsProps {
    resetGame: () => unknown;
    game: Game;
    sectors: Sector[];
}
export function Actions(props: ActionsProps) {
    const [selected, setSelected] = useState<ActionType | null>("survey");
    const handleChange = useCallback((event: React.MouseEvent<HTMLElement>, newSelected: ActionType | null) => {
        setSelected(newSelected);
    }, []);
    const sector = useSelector(recoilSectorStateSelector);
    return (
        <Card sx={{marginBottom: "20px", padding: "0 0 20px 0"}}>
            <CardHeader title={`Sectors ${sector}-${sectorClamp(sector + 8)}`}/>
            <ToggleButtonGroup value={selected} exclusive onChange={handleChange}>
                <ToggleButton value="survey"><WifiFindTwoTone sx={{mr: 1}} /> Survey</ToggleButton>
                <ToggleButton value="target"><TargetIcon sx={{mr: 1}} /> Target</ToggleButton>
                <ToggleButton value="research"><Abc sx={{mr: 1}} /> Research</ToggleButton>
                <ToggleButton value="locatePlanetX"><PlanetXIcon sx={{mr: 1}} /> Locate Planet X</ToggleButton>
                <ToggleButton value="theories"><TheoryIcon sx={{mr: 1}} /> Theories</ToggleButton>
                {/*<ToggleButton value="bot"><BotIcon sx={{mr: 1}} /> Bot</ToggleButton>*/}
                <ToggleButton value="resetGame"><RestartAlt sx={{mr: 1}} /> Reset Game</ToggleButton>
            </ToggleButtonGroup>
            <div>
                {selected === "resetGame" && <ResetGame resetGame={props.resetGame} />}
                {selected === "survey" && <Survey game={props.game}/>}
                {selected === "research" && <Research />}
                {selected === "target" && <Target game={props.game} />}
                {selected === "theories" && <Theories />}
                {selected === "bot" && <Bot />}
                {selected === "locatePlanetX" && <LocatePlanetX game={props.game}/>}
            </div>
        </Card>
    );
}

function ResetGame(props: Pick<ActionsProps, 'resetGame'>) {
    const score = useSelector(scoreSelector);
    const [planetXValue, setPlanetXValue] = useState<number>(0);
    const onPlanetXValueChange = useCallback((event: React.MouseEvent<HTMLElement>, newSelected: number | null) => {
        setPlanetXValue(newSelected ?? 0);
    }, []);
    const dispatch = useDispatch();
    const verifyTheories = useCallback(() => {
        dispatch(verifyAllTheoriesAction());
    }, [dispatch]);
    return (
        <div>
            {score && !score.gameOverReady && <Button onClick={verifyTheories}>Complete Game</Button>}
            {score && score.gameOverReady && <TableContainer component={Card} variant="outlined" sx={{width: "95%", marginLeft: "2.5%", marginTop: "10px", marginBottom: "10px"}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><FirstPlaceIcon /></TableCell>
                            <TableCell><AsteroidIcon /></TableCell>
                            <TableCell><CometIcon /></TableCell>
                            <TableCell><GasCloudIcon /></TableCell>
                            <TableCell><DwarfPlanetIcon /></TableCell>
                            <TableCell><PlanetXScoreSvg style={{height: "1.5rem"}} /></TableCell>
                            <TableCell>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>{score.firstPlace}</TableCell>
                            <TableCell>{score.asteroids}</TableCell>
                            <TableCell>{score.comets}</TableCell>
                            <TableCell>{score.gasClouds}</TableCell>
                            <TableCell>{score.dwarfPlanets}</TableCell>
                            <TableCell>
                                {score.planetX && <ToggleButtonGroup exclusive value={planetXValue} onChange={onPlanetXValueChange}>
                                    <ToggleButton value={2}>2</ToggleButton>
                                    <ToggleButton value={4}>4</ToggleButton>
                                    <ToggleButton value={6}>6</ToggleButton>
                                    <ToggleButton value={8}>8</ToggleButton>
                                    <ToggleButton value={10}>10</ToggleButton>
                                </ToggleButtonGroup>}
                                {!score.planetX && 0}
                            </TableCell>
                            <TableCell>{score.subtotal + planetXValue}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>}
            {score && score.gameOverReady && <Button onClick={props.resetGame}>Reset Game</Button>}
        </div>
    );
}

