import React from 'react';
// import { Plearnit } from 'plearnit-connector';

import Grid from './grid/Grid';
import Timer, { Modes as TimerModes } from './widgets/timer/Timer';
import GameModeUpdate, { GameModes } from '../GameModes';

import {config} from '../config';

interface State {
    mode: GameModes,
    score: number,
    word: string
}

export default class MainApp extends React.Component<any, State> {

    private updateTimerMode: any;
    private updateGridMode: any;
    private wordList: string[] = [];
    private time: number = 15;
    private maxPoints: number = 20;

    constructor(props: any) {
        super(props);

        this.state = {
            mode: GameModes.idle,
            score: 0,
            word: ""
        }
    }

    render() {
        let playButton =    <button
                                className="btn btn-outline-warning"
                                onClick={() => this.giveWord()}
                                disabled={this.state.mode === GameModes.pause || this.state.mode === GameModes.reveal || this.state.mode === GameModes.getReady}
                                >Pause</button>

        if (this.state.mode === GameModes.idle || this.state.mode === GameModes.gameOver) { 
            playButton =    <button
                                className="btn btn-success"
                                onClick={() => this.startGame()}
                                >Start Game</button>
        }
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
                                        time={this.time}
                                        onExpired={this.onTimerExpired} 
                                        setMode={click => this.updateTimerMode = click}
                                        />
                                </div>
                            </div>
                        </div> 
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-6" id="the-word">
                            {this.state.word}
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
                            {playButton}
                        </div>
                    </div>
                    </div>
                </div> 
            </div>
        ) 
    }

    public componentDidMount = () => {
        //Plearnit.addEventListener(Plearnit.events.ACTION_RECEIVED, this.onActionReceived);
        //Plearnit.connect(config.API_URL);
    }

    private getReady = (): void => {
        if (this.wordList.length > 0) {
            this.updateMode(new GameModeUpdate(GameModes.getReady));
            window.setTimeout(this.giveWord, 3000);
        } else {
            this.gameOver();
        } 
    }

    private giveWord = (): void => {
        let word: string | undefined = this.wordList.pop();

        if(word) {
            this.setState({word})
            this.updateMode(new GameModeUpdate(GameModes.presentWord, {word}) );
        } 
    }

    private gameOver = (): void => {
        this.updateMode(new GameModeUpdate(GameModes.gameOver));
    }

    private onActionReceived = (action: string, payload: any ): void => {

    }

    private onWordFound = (): void => {
        this.updateMode(new GameModeUpdate(GameModes.pause));

        let timeRemaining: number = this.updateTimerMode(TimerModes.getTime);
        let points: number = Math.floor(this.maxPoints * (timeRemaining / this.time));

        this.setState({
            score: this.state.score + points,
            word: `+${points} points!`
        });

        window.setTimeout(this.getReady, 3000);
    }

    private onTimerExpired = (): void => {
        this.updateMode(new GameModeUpdate(GameModes.reveal));
        window.setTimeout(this.getReady, 3000);
    }

    private startGame = () => {
        this.updateMode(new GameModeUpdate(GameModes.reset));
        this.setState({word: "", score: 0})
        this.wordList = ["elephant", "giraffe", "zebra", "tiger", "wolf"]
        this.getReady();
    }

    private updateMode = (newMode: GameModeUpdate) => {
        this.updateGridMode(newMode);

        let timerMode: TimerModes = TimerModes.pause;
        switch(newMode.mode) {
            case GameModes.presentWord: timerMode = TimerModes.restart; break;
            case GameModes.reset: timerMode = TimerModes.reset;
        }
        this.updateTimerMode(timerMode);

        let word: string = this.state.word;
        if (newMode.mode === GameModes.getReady) word = "Get Ready!"

        this.setState({
            mode: newMode.mode,
            word
        });
    }
}