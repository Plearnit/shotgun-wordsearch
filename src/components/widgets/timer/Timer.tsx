import React from 'react';

import './timer.css';

interface IProps {
    onExpired(): void,
    setMode(click: any): void
}

interface IState {
    time: number
}

export enum Modes {
    reset,
    start,
    pause
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
        switch(mode) {
            case Modes.start:
                clearInterval(this.clock);
                this.clock = window.setInterval(this.onInterval, 1000);
                this.setState({
                    time: time === -1 ? this.state.time : time
                })
                break;

            case Modes.pause:
                clearInterval(this.clock);
                break;

            case Modes.reset:
                clearInterval(this.clock);
                this.setState({
                    time: time === -1 ? 0 : time
                })
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
}