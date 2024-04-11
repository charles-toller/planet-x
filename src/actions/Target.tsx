import * as React from "react";
import {useCallback, useState} from "react";
import {researchName} from "../Research";
import {Button, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {ActionsProps} from "./Actions";
import {useDispatch, useSelector} from "react-redux";
import {availableSectorsSelector} from "../store/playerSectorPosition";
import {setAction} from "../store/topRows";

export function Target(props: Pick<ActionsProps, 'game'>) {
    const [sector, setSector] = useState<number | null>(null);
    const sectorArray = useSelector(availableSectorsSelector);
    const dispatch = useDispatch();
    const onSubmit = useCallback(() => {
        if (sector === null) return;
        const type = props.game.obj[sector];
        dispatch(setAction({
            action: `T ${sector}`,
            result: researchName([type], true),
            sectors: 4
        }));
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