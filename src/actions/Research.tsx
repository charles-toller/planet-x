import * as React from "react";
import {useCallback} from "react";
import {ConferenceKey} from "../Game";
import {researchName} from "../Research";
import {Button, ButtonGroup} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {setAction} from "../store/topRows";
import {researchRevealAction} from "../store/bottomRows";
import {createSelector} from "@reduxjs/toolkit";
import {ReduxGameState} from "../store/ReduxGameState";

const researchNameSelector = createSelector([(state: ReduxGameState) => state.game], (game): {[key in ConferenceKey]: string} | null => {
    if (game.game == null) return null;
    return Object.fromEntries(Object.entries(game.game.conf).map(([key, val]): [ConferenceKey, string] => {
        return [key as ConferenceKey, researchName(val.title)];
    })) as {[key in ConferenceKey]: string};
})

export function Research() {
    const dispatch = useDispatch();
    const researchName = useSelector(researchNameSelector);
    const research = useCallback((key: ConferenceKey) => {
        dispatch(setAction({
            action: `Research ${key}`,
            result: "",
            sectors: 1,
        }));
        dispatch(researchRevealAction({research: key}));
    }, [dispatch]);
    return (
        <>
            <ButtonGroup orientation="vertical">
                {researchName && Object.entries(researchName).map(([key, val]) => (
                    <Button variant="outlined" onClick={research.bind(null, key as ConferenceKey)}
                            key={key}>{key}: {val}</Button>
                ))}
            </ButtonGroup>
        </>
    )
}