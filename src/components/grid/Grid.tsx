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
    mode: GameModes,
    map: Array<string[]>
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
            mode: GameModes.idle,
            map: []
        }
    }

    render() {
        let cellMode: string;

        return(
            <div className="booger" id="grid">
                { 
                    this.state.map.map( (row: string[], y: number) => {
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
        this.buildGridMap();
    }


    private updateMode = (modeUpdate: GameModeUpdate): void => {
        switch(modeUpdate.mode) {
            case GameModes.idle :
                break;

            case GameModes.presentWord:
                this.setState({
                    mode: modeUpdate.mode,
                    word: modeUpdate.payload.word,
                    highlightedCells: [],
                    selectedCellStartPoint: new Point()
                });
                this.buildGridMap();
                break;

            case GameModes.pause:
                break;

            case GameModes.reveal:
                this.revealWord();
                break;

            case GameModes.getReady:
                this.setState({
                    mode: GameModes.getReady,
                    word: ""
                }, this.buildGridMap);
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
        } else if (this.state.selectedCellStartPoint.getDirectionToward(point) === WordDirections.noDirection) {
            this.buzz.play();
            this.clearSelectedCells();
        }

        let selectedPoints: Point[] = this.extractSelectedCells(this.state.selectedCellStartPoint, point);
        this.setState({highlightedCells: selectedPoints});

        let selectedWord: string = "";
        selectedPoints.forEach((point: Point) => selectedWord += this.state.map[point.y][point.x])
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

    private buildGridMap = (direction?: WordDirections): void => {
        direction = direction? direction : this.allowedDirections[Math.floor(Math.random() * this.allowedDirections.length)];

        let displayLetters: boolean = this.state.mode === GameModes.reveal || this.state.mode === GameModes.presentWord ? true : false;

        let map: Array<string[]> = [];
        let row: Array<string>;
        let startX: number = Math.floor(Math.random() * Math.floor(this.props.size));
        let startY: number = Math.floor(Math.random() * Math.floor(this.props.size));
        let moveX: number = 0;
        let moveY: number = 0;
        
        // prefill map with random letters
        for (let y = 0; y < this.props.size; y ++) {
            row = [];
            for (let x = 0; x < this.props.size; x ++) {
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
                    startX = Math.floor(Math.random() * Math.floor(this.props.size - this.state.word.length));
                    moveX = 1;
                break;
                case WordDirections.SE:
                    startX = Math.floor(Math.random() * Math.floor(this.props.size - this.state.word.length));
                    startY = Math.floor(Math.random() * Math.floor(this.props.size - this.state.word.length));
                    moveX = moveY = 1;
                break;
                case WordDirections.S:
                    startY = Math.floor(Math.random() * Math.floor(this.props.size - this.state.word.length));
                    moveY = 1;
                break;
            }

            this.wordLocation.start = new Point(startY, startX);

            // write the word.
            for(let y = 0 ; y < this.state.word.length; y ++ ){
                map[startY][startX] = this.state.word.charAt(y).toUpperCase();
                startX += moveX;
                startY += moveY;
            }

            this.wordLocation.end = new Point(startY, startX);
        }
    
        this.setState({map});
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