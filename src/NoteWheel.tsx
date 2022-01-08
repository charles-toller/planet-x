import * as React from 'react';
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import wheelplain from './assets/wheelplain.svg';
import ReactDOM from "react-dom";
import {cometSectors, ObjectTypes, ObjId} from "./GameTypes";
import {notNull} from "./util";

export interface Sector {
    x: ObjectTypes[];
    o: ObjectTypes[];
}

interface NoteWheelProps {
    leftSector: number;
    isAdvanced: true;
    sectors: Sector[];
    onObjectClicked?: (object: ObjId) => unknown;
}

type Position = { id: ObjId, rect: DOMRect };
type Positions = Position[][];

function useEmbeddedDocument() {
    const [embedElement, setEmbedElement] = useState<HTMLEmbedElement | null>(null);
    const [document, setDocument] = useState<Document | null>(null);
    const cb = useCallback((el: HTMLEmbedElement | null) => {
        setEmbedElement(el);
        if (el == null) {
            setDocument(null);
            return;
        }
        const doc = el.getSVGDocument();
        if (doc != null) {
            setDocument(doc);
        }
        else {
            const loadCb = () => {
                const doc = el.getSVGDocument()!;
                doc.addEventListener('DOMContentLoaded', () => {
                    setDocument(doc);
                });
                setDocument(el.getSVGDocument()!);
                el.removeEventListener('load', loadCb);
            };
            el.addEventListener('load', loadCb);
        }
    }, []);
    return [embedElement, document, cb] as const;
}

export default function NoteWheel({isAdvanced, leftSector, onObjectClicked, sectors}: NoteWheelProps) {
    const size = isAdvanced ? 18 : 12;
    const [svgRef, docRef, embedRef] = useEmbeddedDocument();
    let deg = (leftSector - 10) * 20;
    const marks = useMemo<JSX.Element[]>(() => {
        if (docRef == null) return [];
        if (svgRef == null) return [];
        const svgEl = docRef.querySelector('#svg9') as SVGSVGElement;
        const svgRect = svgRef.getBoundingClientRect();
        const viewportWidth = svgEl.width.baseVal.value;
        const viewportHeight = svgEl.height.baseVal.value;
        return sectors.map((sector, i) => [
            sector.x.map((t) => {
                const loc: SVGGraphicsElement = docRef.querySelector(`#${t}${i+1}`)!;
                const b = loc.getBBox();
                const m = loc.getCTM()!;
                b.x += b.width / 2;
                b.y += b.height / 2;
                const clientX = ((m.a * b.x) + (m.c * b.y) + m.e);
                const clientY = ((m.b * b.x) + (m.d * b.y) + m.f);
                const x = ((clientX - svgRect.x) / svgRect.width) * viewportWidth;
                const y = ((clientY - svgRect.y) / svgRect.height) * viewportHeight;
                return <text x={x - 9} y={y + 10} fontSize={25} style={{fill: "rgb(151, 0, 0)", cursor: "default", userSelect: "none", pointerEvents: "none"}}>X</text>
            }),
            sector.o.map((t) => {
                const loc: SVGGraphicsElement = docRef.querySelector(`#${t}${i+1}`)!;
                const b = loc.getBBox();
                const m = loc.getCTM()!;
                b.x += b.width / 2;
                b.y += b.height / 2;
                const clientX = ((m.a * b.x) + (m.c * b.y) + m.e);
                const clientY = ((m.b * b.x) + (m.d * b.y) + m.f);
                const x = ((clientX - svgRect.x) / svgRect.width) * viewportWidth;
                const y = ((clientY - svgRect.y) / svgRect.height) * viewportHeight;
                return <text x={x - 11} y={y + 10} fontSize={30} style={{cursor: "default", userSelect: "none", pointerEvents: "none"}}>O</text>
            }),
        ]).flat(2);
    }, [sectors, svgRef, docRef]);
    const positionRef = useRef<Positions | null>(null);
    const onSvgClick = useCallback((e: MouseEvent) => {
        console.log('click handler');
        const positions = positionRef.current;
        if (positions == null) return;
        let id: ObjId | null = null;
        for (const sector of positions) {
            for (const obj of sector) {
                if (e.clientX >= obj.rect.left && e.clientX <= obj.rect.right && e.clientY >= obj.rect.top && e.clientY <= obj.rect.bottom) {
                    id = obj.id;
                    break;
                }
            }
            if (id != null) {
                break;
            }
        }
        if (id != null) {
            onObjectClicked?.(id);
        }
    }, [onObjectClicked]);
    useEffect(() => {
        if (docRef == null) return;
        docRef.addEventListener('click', onSvgClick);
        return () => docRef.removeEventListener('click', onSvgClick);
    }, [docRef, onSvgClick]);
    useEffect(() => {
        if (docRef == null) return;
        positionRef.current = new Array(size).fill(null).map<Array<Position>>((_, i) => (([
            {id: `x${i + 1}`, rect: (docRef.querySelector(`#x${i + 1}`) as SVGPathElement).getBoundingClientRect()},
            {id: `e${i + 1}`, rect: (docRef.querySelector(`#e${i + 1}`) as SVGPathElement).getBoundingClientRect()},
            {id: `g${i + 1}`, rect: (docRef.querySelector(`#g${i + 1}`) as SVGPathElement).getBoundingClientRect()},
            {id: `d${i + 1}`, rect: (docRef.querySelector(`#d${i + 1}`) as SVGPathElement).getBoundingClientRect()},
            {id: `a${i + 1}`, rect: (docRef.querySelector(`#a${i + 1}`) as SVGPathElement).getBoundingClientRect()},
            cometSectors.includes(i + 1) ? {
                id: `c${i + 1}`,
                rect: (docRef.querySelector(`#c${i + 1}`) as SVGPathElement).getBoundingClientRect()
            } as const : null,
        ] as const).filter(notNull)));
    });
    return (
        <>
            <embed ref={embedRef} src={wheelplain}
                   style={{maxHeight: "100%", width: "50%", transition: "transform 200ms linear", transform: `rotate(${-deg}deg)`}}/>
            <SVGAppender r={svgRef} children={marks}/>
        </>
    );
}

function SVGAppender(props: { r: HTMLEmbedElement | null; children: JSX.Element | JSX.Element[] }) {
    const el = useMemo(() => {
        return document.createElementNS('http://www.w3.org/2000/svg', 'g');
    }, []);
    useLayoutEffect(() => {
        if (props.r) {
            const svgDoc = props.r.getSVGDocument();
            if (svgDoc) {
                const svg = svgDoc.children[0];
                if (svg) {
                    svg.appendChild(el);
                    return () => {
                        svg.removeChild(el);
                    }
                }
            }
            else {
                props.r.addEventListener('load', () => {
                    const svgDoc = props.r?.getSVGDocument();
                    if (svgDoc) {
                        const svg = svgDoc.children[0];
                        if (svg) {
                            svg.appendChild(el);
                            return () => {
                                svg.removeChild(el);
                            }
                        }
                    }
                });
            }
        }
    }, [props.r, el]);
    return ReactDOM.createPortal(props.children, el);
}