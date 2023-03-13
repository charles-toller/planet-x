import * as React from 'react';
import {Button, Card, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {PlanetXIcon, TargetIcon} from "./Icons";
import {useCallback, useState} from "react";
import {Abc, WifiFindTwoTone} from "@mui/icons-material";

type ActionType = "survey" | "target" | "research" | "locatePlanetX";

export function Actions() {
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
            </ToggleButtonGroup>
        </Card>
    );
}