import React, {useState} from 'react';
import UIfx from 'uifx';

import GameModeUpdate, {GameModes} from '../../constants'

const bellAudio = require("../../assets/correctBell.mp3");
const buzzAudio = require("../../assets/wrong1.mp3");

interface Props {
    size: number,
    mode: GameModes,
    onWordFound(): void,
    updateMode(click: any): void
}

export enum WordDirections {
    N,
    NE,
    E,
    SE,
    S,
    SW,
    W,
    NW,
    noDirection
}

export const OldGrid = (props: Props): React.ReactElement => {

    const [selectedCellStartPoint, setSelectedCellStartPoint] = useState(new Point());
    const [highlightedCells, updateHighlightedCells] = useState<Point[]>([]);
    const [word, setWord] = useState('');
    const [mode, setMode] = useState(GameModes.idle);
    const [map, setMap] = useState<Array<string[]>>([]);

    const wordLocation: {start: Point, end:Point} = {start: new Point(), end: new Point()};
    const bell: UIfx = new UIfx(bellAudio);
    const buzz: UIfx = new UIfx(buzzAudio);
    const allowedDirections: WordDirections[] = [WordDirections.E, WordDirections.SE, WordDirections.S];

    React.useEffect(() => {
        props.updateMode(updateMode);
        buildGridMap()
    }, [])


    const updateMode = (modeUpdate: GameModeUpdate): void => {
        console.log(modeUpdate);
        switch(modeUpdate.mode) {
            case GameModes.idle :
                break;

            case GameModes.presentWord:
                setMode(modeUpdate.mode);
                setWord(modeUpdate.payload.word);
                updateHighlightedCells([]);
                setSelectedCellStartPoint(new Point());
                buildGridMap();
                break;

            case GameModes.pause:
                break;

            case GameModes.reveal:
                revealWord();
                break;

            case GameModes.getReady:
                setMode(GameModes.getReady);
                setWord('');
                break;
        }
    }

    const revealWord = (): void => {console.log("reveal")
        let direction: WordDirections = wordLocation.start.getDirectionToward(wordLocation.end);
        let revealCells: Point[] = [];

        while (wordLocation.start.y !== wordLocation.end.y || wordLocation.start.x !== wordLocation.end.x) {
            revealCells.push(new Point(wordLocation.start.y, wordLocation.start.x));
            wordLocation.start.incrementToward(direction);
        }
        setMode(GameModes.reveal);
        updateHighlightedCells(revealCells);

        buzz.play();
    }

    const onCellClicked = (point: Point):void => {
        if (mode !== GameModes.presentWord) return;

        if (selectedCellStartPoint.x === -1) {
            updateHighlightedCells([]);
            setSelectedCellStartPoint(point);
            return;

        } else if (selectedCellStartPoint.x === point.x && selectedCellStartPoint.y === point.y) {
            return;
        } else if (selectedCellStartPoint.getDirectionToward(point) === WordDirections.noDirection) {
            buzz.play();
            clearSelectedCells();
        }

        let selectedPoints: Point[] = extractSelectedCells(selectedCellStartPoint, point);
        updateHighlightedCells(selectedPoints);

        let selectedWord: string = "";
        selectedPoints.forEach((point: Point) => selectedWord += map[point.y][point.x])

        if (selectedWord === word.toUpperCase()) {
            bell.play();
            props.onWordFound();
        } else {
            buzz.play();
            window.setTimeout(clearSelectedCells, 1000);
        }
    };

    const clearSelectedCells = (): void => {
        setSelectedCellStartPoint(new Point());
        updateHighlightedCells([]);
    }

    const extractSelectedCells = (start: Point, end: Point): Point[] => {
        let selectedLetters: Point[] = [];
        let direction: WordDirections = start.getDirectionToward(end);
        if (direction === WordDirections.noDirection) return [];

        let difference: Point = new Point(0, 0);

        while (start.y + difference.y !== end.y || start.x + difference.x !== end.x) {
            selectedLetters.push(new Point(start.y + difference.y, start.x + difference.x));
            switch(direction) {
                case WordDirections.E:
                    difference.x ++;
                    break;
                case WordDirections.SE:
                    difference.y ++;
                    difference.x ++;
                    break;
                case WordDirections.S:
                    difference.y ++;
                    break;
            }
        }
        selectedLetters.push(new Point(start.y + difference.y, start.x + difference.x));
        return selectedLetters;
    }

    const buildGridMap = (direction?: WordDirections): void => {
        direction = direction? direction : allowedDirections[Math.floor(Math.random() * allowedDirections.length)];

        let displayLetters: boolean = (mode === GameModes.reveal || mode === GameModes.presentWord);
        let map: Array<string[]> = [];
        let row: Array<string>;
        let startX: number = Math.floor(Math.random() * Math.floor(props.size));
        let startY: number = Math.floor(Math.random() * Math.floor(props.size));
        let moveX: number = 0;
        let moveY: number = 0;

        // prefill map with random letters
        for (let y = 0; y < props.size; y ++) {
            row = [];
            for (let x = 0; x < props.size; x ++) {
                if (displayLetters) {
                    row.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65));
                    //row.push(".");
                } else {
                    row.push("");
                }
            }
            map.push(row);
        }

        if (displayLetters){
            //find a starting point for the word.
            switch(direction) {
                case WordDirections.E:
                    startX = Math.floor(Math.random() * Math.floor(props.size - word.length));
                    moveX = 1;
                break;
                case WordDirections.SE:
                    startX = Math.floor(Math.random() * Math.floor(props.size - word.length));
                    startY = Math.floor(Math.random() * Math.floor(props.size - word.length));
                    moveX = moveY = 1;
                break;
                case WordDirections.S:
                    startY = Math.floor(Math.random() * Math.floor(props.size - word.length));
                    moveY = 1;
                break;
            }

            wordLocation.start = new Point(startY, startX);

            // write the word.
            for(let y = 0 ; y < word.length; y ++ ){
                map[startY][startX] = word.charAt(y).toUpperCase();
                startX += moveX;
                startY += moveY;
            }

            wordLocation.end = new Point(startY, startX);
        }
        setMap(map);
    }

    let cellMode: string;

    return(
        <div id="grid">
            {
                map.map( (row: string[], y: number) => {
                    return(
                        <div className="grid-row" key={`row_${y}`}>{
                            row.map((letter: string, x: number) => {
                                let point: Point = new Point(y, x);
                                cellMode = "";

                                if (mode === GameModes.presentWord) {
                                    cellMode = "selectable-cell";

                                    if ((selectedCellStartPoint.x === point.x && selectedCellStartPoint.y === point.y)) {
                                        cellMode = "selected-cell";
                                    }
                                    highlightedCells.forEach((cell: Point) => {
                                        if (cell.y === y && cell.x === x) cellMode = "selected-cell";
                                    });
                                } else if (mode === GameModes.reveal) {
                                    if ((selectedCellStartPoint.x === point.x && selectedCellStartPoint.y === point.y)) {
                                        cellMode = "revealed-cell";
                                    }
                                    highlightedCells.forEach((cell: Point) => {
                                        if (cell.y === y && cell.x === x) cellMode = "revealed-cell";
                                    });
                                }

                                return(
                                    <div
                                        id={`cell_${y}:${x}`}
                                        className={`cell ${cellMode}`}
                                        key={`letter_${x}`}
                                        onClick={() => onCellClicked(point)}
                                        >{letter}</div>
                                )
                            })
                        }</div>
                    )
                })
            }
        </div>
    )

}

export class Point {

    public y: number;
    public x: number;

    constructor(y: number = -1, x: number = -1) {
        this.y = y;
        this.x = x;
    }

    public getDirectionToward = (point: Point): WordDirections => {
        if (this.y < point.y && this.x === point.x) return WordDirections.S;
        if (this.y === point.y && this.x < point.x) return WordDirections.E;
        if (this.y < point.y && this.x < point.x && point.x - this.x === point.y - this.y) return WordDirections.SE;

        return WordDirections.noDirection;
    }

    public incrementToward = (direction: WordDirections):void => {
        switch(direction) {
            case WordDirections.E:
                this.x ++;
                break;

            case WordDirections.SE:
                this.x ++;
                this.y ++;
                break;

            case WordDirections.S:
                this.y ++;
                break;
        }
    }
}