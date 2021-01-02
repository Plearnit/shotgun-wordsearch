import React from 'react';
import {act} from 'react-dom/test-utils';
import {configure, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {buildGridMap, Grid, Point, WordDirections} from "./Grid";
import {GameModes} from '../../constants';

configure({adapter: new Adapter()});

describe('Grid tests', () => {
    let component: any;
    let word: string;
    let size: number = 15;

    describe('Grid map building', () => {

        beforeAll(() => {
            word = "abcd";
            component = mount(
                <Grid
                    mode={GameModes.presentWord}
                    word={word}
                    wordFound={() => {}}
                    size={size}
                    allowedDirections={[WordDirections.E, WordDirections.SE, WordDirections.S]}
                    />
            );

            act(() => {
                component.update();
            })
        });

        it('should build the correct size grid', () => {
            expect(component.find('.selectable_cell').length).toEqual(size * size);
        });

        it('Should add horizontally', () => {
            word = "horizontal";
            let gridMap = buildGridMap(word, WordDirections.E, size);
            expect(findWordInMap(word, gridMap.map).direction).toEqual(WordDirections.E);
        });
        
        it('should render max len word horizontally', () => {
            word = "abcdefueodlvued";
            let gridMap = buildGridMap(word, WordDirections.E, size);
            expect(findWordInMap(word, gridMap.map).direction).toEqual(WordDirections.E);
        });

        it('should add diagonally', () => {
            word="diagonal";
            let gridMap = buildGridMap(word, WordDirections.SE, size);
            expect(findWordInMap(word, gridMap.map).direction).toEqual(WordDirections.SE);
        });

        it('should render max len word diagonally', () => {
            word="idkeifjrodmjeus";
            let gridMap = buildGridMap(word, WordDirections.SE, size);
            expect(findWordInMap(word, gridMap.map).direction).toEqual(WordDirections.SE);
        }); 

        it('should add vertically', () => {
            word="vertical";
            let gridMap = buildGridMap(word, WordDirections.S, size);
            expect(findWordInMap(word, gridMap.map).direction).toEqual(WordDirections.S);
        });

        it('should render max len word diagonally', () => {
            word="idkeifjrodmjeus";
            let gridMap = buildGridMap(word, WordDirections.S, size);
            expect(findWordInMap(word, gridMap.map).direction).toEqual(WordDirections.S);
        });
        
    });

})

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