import React, { Fragment } from 'react';

import Grid from './grid/Grid';
import Timer, { Modes as TimerModes } from './widgets/timer/Timer';

interface IState {
    active: boolean,
    word: string,
    score: number
}

export default class MainApp extends React.Component<any, IState> {

    private setTimerMode: any;

    constructor(props: any) {
        super(props);

        this.state = {
            active: false,
            word: "",
            score: 0
        }
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-7">
                        <div className="row">
                        <div className="col-12 hr-spacing-10" id="score-board">
                            <div className="row">
                                <div className="col-6" id="score">
                                    {this.state.score}
                                </div>
                                <div className="col-6" id="timer">
                                    <Timer 
                                        onExpired={this.onTimerExpired} 
                                        setMode={click => this.setTimerMode = click}
                                        />
                                </div>
                            </div>
                        </div> 
                    </div>
                    <div className="row">  
                        <div className="col-12 text-center">
                            <Grid 
                                word={this.state.word} 
                                size={10} 
                                onWordFound={this.onWordFound}
                                active={this.state.active}
                                />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 text-center">
                            <button
                            className="btn btn-success"
                            disabled={this.state.active}
                            onClick={() => this.giveWord()}
                            >Next Word</button>
                        </div>
                    </div>
                    </div>
                </div> 
            </div>
        ) 
    }

    private giveWord = (): void => {
        this.setState({
            word: "test" + String.fromCharCode(Math.floor(Math.random() * 26) + 65),
            active: true
        });
        this.setTimerMode(TimerModes.start, 20);
    }

    private onWordFound = (): void => {
        this.setState({active: false});
        let remainingTime:number = this.setTimerMode(TimerModes.pause);

    }

    private onTimerExpired = (): void => {
        this.setState({active: false});
        console.log("timer expired")
    }
} 