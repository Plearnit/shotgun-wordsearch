import React, {useState} from 'react';
import UIfx from 'uifx';
import {GameModes} from "../../constants";
import './grid.scss';

const buzzAudio = require("../../assets/wrong1.mp3");

interface Props {
    mode: GameModes,
    word: string,
    wordFound: () => void,
    size: number,
    allowedDirections: WordDirections[]
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

export const Grid = (props: Props): React.ReactElement => {

    const buzz: UIfx = new UIfx(buzzAudio);

    const direction: WordDirections = props.allowedDirections[Math.floor(Math.random() * props.allowedDirections.length)];

    const [gridMap, setGridMap] = useState<BuildGridMap>({map: [], wordLocation: {start: new Point(), end: new Point()}});
    const [selectedCellStartPoint, setSelectedCellStartPoint] = useState(new Point());
    const [highlightedCells, updateHighlightedCells] = useState<Point[]>([]);
    const [invalidWord, setInvalidWord] = useState(false);

    React.useEffect(() => {
        switch(props.mode) {
            case GameModes.idle :
                setGridMap(buildGridMap('', direction, props.size));
                break;

            case GameModes.presentWord:
                //setMode(modeUpdate.mode);
                //setWord(modeUpdate.payload.word);
                updateHighlightedCells([]);
                setSelectedCellStartPoint(new Point());
                setGridMap(buildGridMap(props.word, direction, props.size));
                break;

            case GameModes.pause:
                break;

            case GameModes.reveal:
                console.log('rev')
                revealWord();
                break;

            case GameModes.getReady:
                //setMode(GameModes.getReady);
                //setWord('');
                break;
        }
    }, [props.mode])

    const clearSelectedCells = (): void => {
        setSelectedCellStartPoint(new Point());
        updateHighlightedCells([]);
        setInvalidWord(false);
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

    const onCellClicked = (point: Point):void => {
        if (props.mode !== GameModes.presentWord) return;

        if (selectedCellStartPoint.x === -1) {
            updateHighlightedCells([]);
            setSelectedCellStartPoint(point);
            return;

        } else if (selectedCellStartPoint.x === point.x && selectedCellStartPoint.y === point.y) {
            return;
        } else if (selectedCellStartPoint.getDirectionToward(point) === WordDirections.noDirection) {
            //buzz.play();
            clearSelectedCells();
        }

        let selectedPoints: Point[] = extractSelectedCells(selectedCellStartPoint, point);
        updateHighlightedCells(selectedPoints);

        let selectedWord: string = "";
        selectedPoints.forEach((point: Point) => selectedWord += gridMap.map[point.y][point.x])

        if (selectedWord === props.word.toUpperCase()) {
            props.wordFound();
        } else {
            setInvalidWord(true);
            buzz.play(1);
            window.setTimeout(clearSelectedCells, 1000);
        }
    };

    const revealWord = (): void => {console.log("reveal")
        let direction: WordDirections = gridMap.wordLocation.start.getDirectionToward(gridMap.wordLocation.end);
        let revealCells: Point[] = [];

        while (gridMap.wordLocation.start.y !== gridMap.wordLocation.end.y || gridMap.wordLocation.start.x !== gridMap.wordLocation.end.x) {
            revealCells.push(new Point(gridMap.wordLocation.start.y, gridMap.wordLocation.start.x));
            gridMap.wordLocation.start.incrementToward(direction);
        }
        updateHighlightedCells(revealCells);
    }

    let cellMode: string;

    return(
        <div id="grid">
            {
                gridMap.map.map( (row: string[], y: number) => {
                    return(
                        <div className="grid-row" key={`row_${y}`}>{
                            row.map((letter: string, x: number) => {
                                let point: Point = new Point(y, x);
                                cellMode = "";

                                if ((props.mode === GameModes.presentWord || props.mode === GameModes.showCorrectWord) && !invalidWord) {
                                    cellMode = "selectable_cell";

                                    if ((selectedCellStartPoint.x === point.x && selectedCellStartPoint.y === point.y)) {
                                        cellMode = "selected-cell";
                                    }
                                    highlightedCells.forEach((cell: Point) => {
                                        if (cell.y === y && cell.x === x) cellMode = "selected-cell";
                                    });
                                } else if (props.mode === GameModes.reveal || invalidWord) {
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

type BuildGridMap = {
    map: Array<string[]>,
    wordLocation: {start: Point, end: Point}
}

export const buildGridMap = (word: string, direction: WordDirections, gridSize: number): BuildGridMap => {

    let map: Array<string[]> = [];
    let row: Array<string>;
    let startX: number = Math.floor(Math.random() * Math.floor(gridSize));
    let startY: number = Math.floor(Math.random() * Math.floor(gridSize));
    let moveX: number = 0;
    let moveY: number = 0;
    let wordLocation: {start: Point, end:Point} = {start: new Point(), end: new Point()};

    // prefill map with random letters
    for (let y = 0; y < gridSize; y ++) {
        row = [];
        for (let x = 0; x < gridSize; x ++)
            row.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65));

        map.push(row);
    }

    switch(direction) {
        case WordDirections.E:
            startX = Math.floor(Math.random() * Math.floor(gridSize - word.length));
            moveX = 1;
        break;
        case WordDirections.SE:
            startX = Math.floor(Math.random() * Math.floor(gridSize - word.length));
            startY = Math.floor(Math.random() * Math.floor(gridSize - word.length));
            moveX = moveY = 1;
        break;
        case WordDirections.S:
            startY = Math.floor(Math.random() * Math.floor(gridSize - word.length));
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
    return ({map, wordLocation});
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