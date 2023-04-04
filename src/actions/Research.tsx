import {useRecoilValue} from "recoil";
import {tableActions} from "../tables";
import * as React from "react";
import {useCallback} from "react";
import {ConferenceKey} from "../Game";
import {researchLookup, researchName} from "../Research";
import {Button, ButtonGroup} from "@mui/material";
import {ActionsProps} from "./Actions";

export function Research(props: Pick<ActionsProps, 'game'>) {
    const {setResearch, setAction} = useRecoilValue(tableActions);
    const research = useCallback((key: ConferenceKey) => {
        const info = props.game?.conf[key];
        if (info === undefined) return;
        setResearch(key, researchLookup[info.body.type](info.body as any) + ".");
        if (!key.startsWith("X")) {
            setAction(`Research ${key}`, "", 1);
        }
    }, [setResearch, props.game]);
    return (
        <>
            <ButtonGroup orientation="vertical">
                {Object.entries(props.game?.conf ?? {}).map(([key, val]) => (
                    <Button variant="outlined" onClick={research.bind(null, key as ConferenceKey)}
                            key={key}>{key}: {researchName(val.title)}</Button>
                ))}
            </ButtonGroup>
        </>
    )
}