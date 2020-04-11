import React from 'react';

import Grid from './grid/Grid';
import Timer, { Modes as TimerModes } from './widgets/timer/Timer';

import GameModeUpdate, { GameModes } from '../GameModes';

interface IState {
    mode: GameModes,
    score: number
}

export default class MainApp extends React.Component<any, IState> {

    private updateTimerMode: any;
    private updateGridMode: any;
    private wordList: string[] = ["wordone", "wordtwo", "wordthree", "wordfour", "wordfive"];

    constructor(props: any) {
        super(props);

        this.state = {
            mode: GameModes.idle,
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
                                        time={5}
                                        onExpired={this.onTimerExpired} 
                                        setMode={click => this.updateTimerMode = click}
                                        />
                                </div>
                            </div>
                        </div> 
                    </div>
                    <div className="row">  
                        <div className="col-12 text-center">
                            <Grid 
                                size={10} 
                                onWordFound={this.onWordFound}
                                updateMode={click => this.updateGridMode = click}
                                />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 text-center">
                            <button
                            className="btn btn-success"
                            disabled={this.state.mode === GameModes.presentWord}
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
        if (this.wordList.length > 0) {
            this.updateMode(
                new GameModeUpdate(GameModes.presentWord, {
                    word: this.wordList.pop(),
                    time: 5
                })
            )
        }  
    }

    private onWordFound = (): void => {
        this.updateMode(new GameModeUpdate(GameModes.pause));
    }

    private onTimerExpired = (): void => {
        this.updateMode(new GameModeUpdate(GameModes.reveal));
    }

    private updateMode = (newMode: GameModeUpdate) => {
        this.updateGridMode(newMode);

        let timerMode: TimerModes = newMode.mode === GameModes.presentWord? TimerModes.restart : TimerModes.pause;
        this.updateTimerMode(timerMode);

        this.setState({mode: newMode.mode})
    }
}