import * as React from 'react';
import {useCallback, useState} from 'react';
import {Button, Card, CardHeader, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {PlanetXIcon, TargetIcon, TheoryIcon} from "../Icons";
import {Abc, RestartAlt, WifiFindTwoTone} from "@mui/icons-material";
import {Game} from "../Game";
import {useRecoilValue} from "recoil";
import {sectorClamp, sectorState} from "../atoms";
import {Theories} from "./Theories";
import {Target} from "./Target";
import {Survey} from "./Survey";
import {Research} from "./Research";

type ActionType = "survey" | "target" | "research" | "locatePlanetX" | "theories" | "resetGame";

export interface ActionsProps {
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

function ResetGame(props: Pick<ActionsProps, 'resetGame'>) {
    return (
        <Button onClick={props.resetGame}>Reset Game</Button>
    );
}
