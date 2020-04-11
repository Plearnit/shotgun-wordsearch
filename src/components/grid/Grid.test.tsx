import React from 'react';
import {shallow, configure, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Grid, { Point, WordDirections } from './Grid';
import GameModeUpdate, { GameModes } from '../../GameModes'

configure({adapter: new Adapter()});

describe('Grid tests', () => {
    let component: any;
    let word: string;
    let map: Array<string[]>;
    let size: number = 15;
    let onWordFound = (): void => { console.log("found")}
    let updateGridMode: any;

    describe('Grid map building', () => {

        beforeAll(() => {
            word = "abcd";
            component = shallow(<Grid size = {size} onWordFound={onWordFound} updateMode={click => updateGridMode = click} />);
        });

        it('should build the correct size grid', () => {
            map = component.instance().buildGridMap(word, WordDirections.E, size);
            expect(map.length).toEqual(size);
            expect(map[0]).not.toBe(null);
            expect(map[0].length).toEqual(size);
        });

        it('Should add horizontally', () => {
            word = "horizontal";
            map = component.instance().buildGridMap(word, WordDirections.E, size);
            expect(findWordInMap(word, map).direction).toEqual(WordDirections.E);
        });
        
        it('should render max len word horizontally', () => {
            word = "abcdefueodlvued";
            map = component.instance().buildGridMap(word, WordDirections.E, size);
            expect(findWordInMap(word, map).direction).toEqual(WordDirections.E);
        });

        it('should add diagonally', () => {
            word="diagonal";
            map = component.instance().buildGridMap(word, WordDirections.SE, size);
            expect (findWordInMap(word, map).direction).toEqual(WordDirections.SE);
        });

        it('should render max len word diagonally', () => {
            word="idkeifjrodmjeus";
            map = component.instance().buildGridMap(word, WordDirections.SE, size);
            expect (findWordInMap(word, map).direction).toEqual(WordDirections.SE);
        }); 

        it('should add vertically', () => {
            word="vertical";
            map = component.instance().buildGridMap(word, WordDirections.S, size);
            expect (findWordInMap(word, map).direction).toEqual(WordDirections.S);
        });

        it('should render max len word diagonally', () => {
            word="idkeifjrodmjeus";
            map = component.instance().buildGridMap(word, WordDirections.S, size);
            expect (findWordInMap(word, map).direction).toEqual(WordDirections.S);
        });
        
    });

    describe('word selection tests', () => {

        beforeAll(() => {
            word = "abcd";
            component = mount(<Grid size={size} onWordFound={onWordFound} updateMode={click => updateGridMode = click} />);
        });

        it('should respond if word is incorrect', () => {
            let selectedCells: Point[] = component.instance().extractSelectedCells(new Point(0,0), new Point(10,0));
            expect(compareSelectedWordToTargetWord(word, selectedCells, component.instance().map)).toEqual(false);
        });

        it('should respond if word is correct', () => {
            updateGridMode(new GameModeUpdate(GameModes.presentWord, word));
            let wordLocation: FindWordInMapResponse = findWordInMap(word, component.instance().map);
            //console.log(wordLocation, component.instance().map);
            let selectedCells: Point[] = component.instance().extractSelectedCells(wordLocation.start, wordLocation.end);
            expect(compareSelectedWordToTargetWord(word, selectedCells, component.instance().map)).toEqual(true);
        });

        it('should light up first letter clicked', () => {
            component = mount(<Grid size = {size} onWordFound={onWordFound} updateMode={click => updateGridMode = click}/>); 
            component.instance().onCellClicked(new Point(5,5));
            //console.log(component.find("#cell_0:0").first());
        });

        it('should light up selected word', () => {
            throw new Error();
            /*
            let wordLocation: FindWordInMapResponse = findWordInMap(word, map);
            component.instance().onLetterClicked(wordLocation.start);
            component.instance().onLetterClicked(wordLocation.end);

            let difference: Point = new Point(0,0);
            let valid: boolean = true;
            while ((wordLocation.start.y + difference.y < wordLocation.end.y ||
                    wordLocation.start.x + difference.x < wordLocation.end.x) &&
                    valid) {
                        //valid = component.find(`#cell_${wordLocation.start.y + difference.y}:${wordLocation.start.x + difference.x}`);
                        switch(wordLocation.direction) {
                            case WordDirections.E:
                                difference.x ++;
                                break;
                            case WordDirections.SE:
                                difference.x ++;
                                difference.y ++;
                                break;
                            case WordDirections.S:
                                difference.y ++;
                                break;
                        } 
            }

            expect(valid).toEqual(true);
            */
        });
    }) 
})

const compareSelectedWordToTargetWord = (targetWord: string, selectedCells: Point[], map: Array<string[]>): boolean => {    
    let selectedWord: string = "";
    selectedCells.forEach((cell: Point) => selectedWord += map[cell.y][cell.x]);
    return selectedWord === targetWord.toUpperCase();
}

const findWordInMap = (word: string, map: Array<string[]>): FindWordInMapResponse => {
    word = word.toUpperCase();
    let y, x;
    let mapString = "";
    let testWordResponse: Point;

    for (y = 0; y < map.length; y ++ ) {
        for (x=0; x < map.length; x ++ ) {
            mapString += map[y][x];
        }
        mapString += "\n";
    }

    //console.log(mapString);
    
    for (y = 0; y < map.length; y ++) {
        for (x = 0; x  < map.length; x ++) {
            if (map[y][x] === word.charAt(0)) {
                if (x < map.length) {
                    testWordResponse = findWord(word, new Point(y, x), WordDirections.E, map);
                    if (testWordResponse.x !== -1) return new FindWordInMapResponse(WordDirections.E, new Point(y, x), testWordResponse);
                }

                if (x < map.length && y < map.length) {
                    testWordResponse = findWord(word, new Point(y, x), WordDirections.SE, map)
                    if (testWordResponse.x !== -1) return new FindWordInMapResponse(WordDirections.SE, new Point(y, x), testWordResponse);
                }

                if (y < map.length) {
                    testWordResponse = findWord(word, new Point(y, x), WordDirections.S, map)
                    if (testWordResponse.x !== -1) return new FindWordInMapResponse(WordDirections.S, new Point(y, x), testWordResponse);
                }
            }
        }
    }

    return new FindWordInMapResponse(0, new Point(), new Point());
}

const findWord = (word: string, point: Point, direction: WordDirections, map: Array<string[]>): Point => {
    if (map[point.y][point.x] !== word.charAt(0)) return new Point();
    if (map[point.y][point.x] === word.charAt(0) && word.length === 1) return new Point(point.y, point.x);

    word = word.substr(1);

    switch(direction) {
        case WordDirections.E:
            if (point.x === map.length) return new Point();
            return findWord(word, new Point(point.y, point.x + 1), direction, map);

        case WordDirections.SE:
            if (point.x === map.length || point.y === map.length) return new Point();
            return findWord(word, new Point(point.y + 1, point.x + 1), direction, map);

        case WordDirections.S:
            if (point.y === map.length) return new Point();
            return findWord(word, new Point(point.y + 1, point.x), direction, map);
    }

    return new Point();
}

class FindWordInMapResponse {
    public start: Point;
    public end: Point;
    public direction: number;

    constructor(direction: number, start: Point, end: Point) {
        this.direction = direction;
        this.start = start;
        this.end = end;
    }
}