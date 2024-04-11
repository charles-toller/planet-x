import {ConferenceKey} from "./Game";

export interface TopRowModel {
    id: number;
    action: string;
    p2: string;
    p3: string;
    p4: string;
    result: string;
}

export interface BottomRowModel {
    id: number;
    notes: string;
    otherNotes: string;
    researchId: ConferenceKey;
    researchType: string;
}

export const surveyReg = /^\s*([egdac])\s*(\d+)\s*-\s*(\d+)\s*$/i;