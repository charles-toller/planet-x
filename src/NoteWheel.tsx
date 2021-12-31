import * as React from 'react';
import wheelplain from './assets/wheelplain.svg';
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import ReactDOM from "react-dom";

type ObjectTypes = 'x' | 'e' | 'g' | 'd' | 'a' | 'c';
export interface Sector {
    x: ObjectTypes[];
    o: ObjectTypes[];
}

interface NoteWheelProps {
    leftSector: number;
    isAdvanced: true;
    sectors: Sector[];
}
interface Marks {
    x: string[];
    o: string[];
}
function notNull<T>(a: T | null | undefined): a is T {
    return a != null;
}
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
export default function NoteWheel(props: NoteWheelProps) {
    const [svgRef, docRef, embedRef] = useEmbeddedDocument();
    let deg = (props.leftSector - 10) * 20;
    const marks = useMemo<JSX.Element[]>(() => {
        if (docRef == null) return [];
        console.log('marks!');
        return props.sectors.map((sector, i) => [
            sector.x.map((t) => {
                const loc: SVGGraphicsElement = docRef.querySelector(`#${t}${i+1}`)!;
                const b = loc.getBBox();
                const m = loc.getCTM()!;
                b.x += b.width / 2;
                b.y += b.height / 2;
                const x = (m.a * b.x) + (m.c * b.y) + m.e;
                const y = (m.b * b.x) + (m.d * b.y) + m.f;
                return <text x={x - 9} y={y + 8} fontSize={25} style={{fill: "rgb(151, 0, 0)"}}>X</text>
            }),
            sector.o.map((t) => {
                const loc: SVGGraphicsElement = docRef.querySelector(`#${t}${i+1}`)!;
                const b = loc.getBBox();
                const m = loc.getCTM()!;
                b.x += b.width / 2;
                b.y += b.height / 2;
                const x = (m.a * b.x) + (m.c * b.y) + m.e;
                const y = (m.b * b.x) + (m.d * b.y) + m.f;
                return <text x={x - 11} y={y + 10} fontSize={30}>O</text>
            }),
        ]).flat(2);
    }, [props.sectors, docRef, props.leftSector]);
    // useLayoutEffect(() => {
    //     if (docRef == null) return;
    //     docRef.addEventListener('click', (e) => console.log(e));
    // });
    return (
        <>
            <embed ref={embedRef} src={wheelplain} style={{transition: "transform 200ms linear", transform: `rotate(${-deg}deg)`}} />
            <SVGAppender r={svgRef} children={marks} />
        </>
    );
}
function SVGAppender(props: {r: HTMLEmbedElement | null; children: JSX.Element | JSX.Element[]}) {
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