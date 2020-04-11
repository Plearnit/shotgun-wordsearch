import React from 'react';
import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Timer, { Modes as TimerModes } from './Timer';

configure({adapter: new Adapter()});
jest.useFakeTimers();

describe('Timer tests', () => {

    let component: any;
    let onTimerExpired = () => {console.log("timer expired")};
    let setTimerMode: any;

    beforeEach(() => {
        component = shallow(<Timer onExpired={onTimerExpired} setMode={click => setTimerMode = click} />)
    })

    it('resets to given time', () => {
        setTimerMode(TimerModes.reset, 10);
        expect(component.find(".timer").first().text()).toEqual("10");
    });

    it('should display minutes and seconds based on seconds given', () => {
        setTimerMode(TimerModes.reset, 100);
        expect(component.find(".timer").first().text()).toEqual("1:40");
        expect(clearInterval).toHaveBeenCalled(); 
    });

    it('should start running when Modes.start is sent', () => {
        setTimerMode(TimerModes.start, 10);
        expect(setInterval).toHaveBeenCalledTimes(1);
    })

    it('should stop running when TimerModes.pause is sent', () => {
        setTimerMode(TimerModes.start, 10);
        expect(setInterval).toHaveBeenCalled();

        setTimerMode(TimerModes.pause);
        expect(clearInterval).toBeCalled();
    })

    it('should trigger callback when time runs out', () => {
        throw new Error();
    });
});