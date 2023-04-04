import * as React from "react";
import {useCallback, useState} from "react";
import {useRecoilValue} from "recoil";
import {availableSectors} from "../atoms";
import {tableActions} from "../tables";
import {researchName} from "../Research";
import {Button, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {ActionsProps} from "./Actions";

export function Target(props: Pick<ActionsProps, 'game'>) {
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