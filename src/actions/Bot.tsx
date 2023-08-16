import * as React from "react";
import {useCallback} from "react";
import {useSetRecoilState} from "recoil";
import {Button} from "@mui/material";
import {ActionsProps} from "./Actions";
import {botState} from "../tableState";
export function Bot(props: Pick<ActionsProps, 'game'>) {
    const setBotTick = useSetRecoilState(botState);
    const onButtonClick = useCallback(() => {
        setBotTick((botState) => ({
            ...botState,
            nextAction: botState.nextAction + 1,
        }));
    }, []);
    return (
        <>
            <Button variant="outlined" onClick={onButtonClick}>Trigger Bot Action</Button>
        </>
    )
}