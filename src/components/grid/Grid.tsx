import React from 'react';
import UIfx from 'uifx';

import GameModeUpdate, { GameModes } from '../../GameModes'

const bellAudio = require("../../assets/correctBell.mp3");
const buzzAudio = require("../../assets/wrong1.mp3");

interface IProps {
    size: number,
    onWordFound(): void,
    updateMode(click: any): void
}

interface IState {
    selectedCellStartPoint: Point,
    highlightedCells: Point[],
    word: string,
    mode: GameModes
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

export default class Grid extends React.Component<IProps, IState> {

    private map: Array<string[]> = [];
    private wordLocation: {start: Point, end:Point} = {start: new Point(), end: new Point()};
    private bell: UIfx = new UIfx(bellAudio);
    private buzz: UIfx = new UIfx(buzzAudio);
    private allowedDirections: WordDirections[] = [WordDirections.E, WordDirections.SE, WordDirections.S];

    constructor(props: IProps) {
        super(props);

        this.state = {
            selectedCellStartPoint: new Point(),
            highlightedCells: [],
            word: "",
            mode: GameModes.idle
        }

        this.map = this.buildGridMap(this.state.word, this.allowedDirections[Math.floor(Math.random() * 3)], this.props.size);
    }

    render() {
        let cellMode: string;

        return(
            <div className="booger" id="grid">
                { 
                    this.map.map( (row: string[], y: number) => {
                        return(
                            <div className="grid-row" key={`row_${y}`}>{
                                row.map((letter: string, x: number) => {
                                    let point: Point = new Point(y, x);
                                    cellMode = "";

                                    if (this.state.mode === GameModes.presentWord) {
                                        cellMode = "selectable-cell";

                                        if ((this.state.selectedCellStartPoint.x === point.x && this.state.selectedCellStartPoint.y === point.y)) {
                                            cellMode = "selected-cell";
                                        }
                                        this.state.highlightedCells.forEach((cell: Point) => {
                                            if (cell.y === y && cell.x === x) cellMode = "selected-cell";
                                        });
                                    } else if (this.state.mode === GameModes.reveal) {
                                        if ((this.state.selectedCellStartPoint.x === point.x && this.state.selectedCellStartPoint.y === point.y)) {
                                            cellMode = "revealed-cell";
                                        }
                                        this.state.highlightedCells.forEach((cell: Point) => {
                                            if (cell.y === y && cell.x === x) cellMode = "revealed-cell";
                                        });
                                    }

                                    return(
                                        <div 
                                            id={`cell_${y}:${x}`}
                                            className={`cell ${cellMode}`}
                                            key={`letter_${x}`}
                                            onClick={() => this.onCellClicked(point)}
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

    componentDidMount = () => {
        this.props.updateMode(this.updateMode);
    }

    private updateMode = (modeUpdate: GameModeUpdate): void => {
        switch(modeUpdate.mode) {
            case GameModes.idle :
                break;

            case GameModes.presentWord:
                this.map = this.buildGridMap(modeUpdate.payload.word, this.allowedDirections[Math.floor(Math.random() * 3)], this.props.size);
                this.setState({
                    mode: modeUpdate.mode,
                    word: modeUpdate.payload.word,
                    highlightedCells: [],
                    selectedCellStartPoint: new Point()
                });
                break;

            case GameModes.pause:
                break;

            case GameModes.reveal:
                this.revealWord();
                break;
        } 
    }

    private revealWord = (): void => {console.log("reveal")
        let direction: WordDirections = this.wordLocation.start.getDirectionToward(this.wordLocation.end);
        let revealCells: Point[] = [];
        
        while (this.wordLocation.start.y !== this.wordLocation.end.y || this.wordLocation.start.x !== this.wordLocation.end.x) {
            revealCells.push(new Point(this.wordLocation.start.y, this.wordLocation.start.x));
            this.wordLocation.start.incrementToward(direction);
        }

        this.setState({
            mode: GameModes.reveal,
            highlightedCells: revealCells
        });

        this.buzz.play();
    }

    private onCellClicked = (point: Point):void => {
        if (this.state.mode !== GameModes.presentWord) return;
        
        if (this.state.selectedCellStartPoint.x === -1) {
            this.setState({
                selectedCellStartPoint: point,
                highlightedCells: []
            });
            return;
        } else if (this.state.selectedCellStartPoint.x === point.x && this.state.selectedCellStartPoint.y === point.y) {
            return;
        }

        let selectedPoints: Point[] = this.extractSelectedCells(this.state.selectedCellStartPoint, point);
        this.setState({highlightedCells: selectedPoints});

        let selectedWord: string = "";
        selectedPoints.forEach((point: Point) => selectedWord += this.map[point.y][point.x])
        console.log(this.state)
        if (selectedWord === this.state.word.toUpperCase()) {
            this.bell.play();
            this.props.onWordFound();
        } else {
            this.buzz.play();
            window.setTimeout(this.clearSelectedCells, 1000);
        }
    };

    private clearSelectedCells = (): void => {
        this.setState({
            selectedCellStartPoint: new Point(),
            highlightedCells: []
        });
    }

    private extractSelectedCells = (start: Point, end: Point): Point[] => {
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

    private buildGridMap = (word: string, direction: WordDirections, size: number): string[][] => {
        let map: Array<string[]> = [];
        let row: Array<string>;
        let startX: number = Math.floor(Math.random() * Math.floor(size));
        let startY: number = Math.floor(Math.random() * Math.floor(size));
        let moveX: number = 0;
        let moveY: number = 0;
        
        // prefill map with random letters
        for (let y = 0; y < size; y ++) {
            row = [];
            for (let x = 0; x < size; x ++) {
                //row.push(String.fromCharCode(Math.floor(Math.random() * 26) + 65));
                row.push(".");
            }
            map.push(row);
        } 

        //find a starting point for the word.
        switch(direction) {
            case WordDirections.E:
                startX = Math.floor(Math.random() * Math.floor(size - word.length));
                moveX = 1;
            break;
            case WordDirections.SE:
                startX = Math.floor(Math.random() * Math.floor(size - word.length));
                startY = Math.floor(Math.random() * Math.floor(size - word.length));
                moveX = moveY = 1;
            break;
            case WordDirections.S:
                startY = Math.floor(Math.random() * Math.floor(size - word.length));
                moveY = 1;
            break;
        }

        this.wordLocation.start = new Point(startY, startX);

        // write the word.
        for(let y = 0 ; y < word.length; y ++ ){
            map[startY][startX] = word.charAt(y).toUpperCase();
            startX += moveX;
            startY += moveY;
        }

        this.wordLocation.end = new Point(startY, startX);
        return map;
    }
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