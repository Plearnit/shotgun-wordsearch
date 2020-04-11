import React from 'react';

import './timer.css';

interface IProps {
    time: number,
    onExpired(): void,
    setMode(click: any): void
}

interface IState {
    time: number
}

export enum Modes {
    idle,
    reset,
    restart,
    start,
    pause,
    getTime
}

export default class Timer extends React.Component<IProps, IState> {

    private clock: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            time: 0
        }
    }

    render() {
        const minutes: number =  ~~(this.state.time / 60);
        const seconds: number = this.state.time - (minutes * 60);

        return (
            <div className="timer">
                {
                    minutes > 0 ? `${minutes}:${seconds}` : seconds
                }
            </div>
        )
    }

    componentDidMount = () => {
        this.props.setMode(this.setMode);
    }

    private setMode = (mode: Modes, time:number = -1): number => {
        clearInterval(this.clock);

        switch(mode) {
            case Modes.start:
                this.startClock();
                break;

            case Modes.pause:
                break;

            case Modes.reset:
                this.setState({time: this.props.time})
                break;

            case Modes.restart:
                this.startClock(this.props.time);
                break;
        }
        return this.state.time;
    }

    private onInterval = () => {
        this.setState({time: this.state.time - 1});

        if (this.state.time === 0) {
            clearInterval(this.clock);
            this.props.onExpired();
        }
    }

    private startClock = (time: number = this.state.time) => {
        this.setState({time: time});
        this.clock = window.setInterval(this.onInterval, 1000);
    }
}