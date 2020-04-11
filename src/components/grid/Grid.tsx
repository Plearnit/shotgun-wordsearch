import React from 'react';
import UIfx from 'uifx';

const bellAudio = require("../../assets/correctBell.mp3");
const buzzAudio = require("../../assets/wrong1.mp3");

interface IProps {
    word: string,
    size: number,
    onWordFound(): void,
    active: boolean
}

interface IState {
    selectedCellStartPoint: Point,
    highlightedCells: Point[]
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
    private word: string = "";
    private bell: UIfx = new UIfx(bellAudio);
    private buzz: UIfx = new UIfx(buzzAudio);
    private allowedDirections: WordDirections[] = [WordDirections.E, WordDirections.SE, WordDirections.S];

    constructor(props: IProps) {
        super(props);

        this.state = {
            selectedCellStartPoint: new Point(),
            highlightedCells: []
        }

        this.map = this.buildGridMap(this.word, this.allowedDirections[Math.floor(Math.random() * 3)], this.props.size);
    }

    render() {
        return(
            <div className="booger" id="grid">
                { 
                    this.map.map( (row: string[], y: number) => {
                        return(
                            <div className="grid-row" key={`row_${y}`}>{
                                row.map((letter: string, x: number) => {
                                    let cellSelected: boolean = false;
                                    let point: Point = new Point(y, x);
                                    if ((this.state.selectedCellStartPoint.x === point.x && this.state.selectedCellStartPoint.y === point.y)) {
                                        cellSelected = true;
                                    }
                                    this.state.highlightedCells.forEach((cell: Point) => {
                                        if (cell.y === y && cell.x === x) cellSelected = true;
                                    });

                                    let selectableClass: string =   this.props.active ? 
                                                                        cellSelected ? 
                                                                            'selected-letter' : 'unselected-letter' 
                                                                    : ""
                                    return(
                                        <div 
                                            id={`cell_${y}:${x}`}
                                            className={`grid-letter ${selectableClass}`}
                                            key={`letter_${x}`}
                                            onClick={() => this.onLetterClicked(point)}
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

    componentWillReceiveProps = (props: IProps): void => {
        if (props.word !== this.word) {
            this.word = props.word;
            this.map = this.buildGridMap(this.word, this.allowedDirections[Math.floor(Math.random() * 3)], this.props.size);
            this.setState({selectedCellStartPoint: new Point(), highlightedCells: []})
        }
    }

    private onLetterClicked = (point: Point):void => {
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
        
        if (selectedWord === this.props.word.toUpperCase()) {
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

        // write the word.
        for(let y = 0 ; y < word.length; y ++ ){
            map[startY][startX] = word.charAt(y).toUpperCase();
            startX += moveX;
            startY += moveY;
        }
        
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
}