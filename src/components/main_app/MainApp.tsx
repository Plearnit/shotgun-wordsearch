import React from 'react';
import UIfx from 'uifx';
import PlearnitService, {PlearnitEvents} from '../../plearnit_service/PlearnitService';

import {Grid, WordDirections} from '../grid/Grid';
import {Timer} from '../widgets/timer/Timer';
import {GameModes} from '../../constants';
import VocabEntry from "../../plearnit_service/models/VocabEntry";
import RoundQuestion from "../../plearnit_service/models/RoundQuestion";
import Player from "../../plearnit_service/models/Player";

import './main_app.scss';

const bellAudio = require("../../assets/correctBell.mp3");
const buzzAudio = require("../../assets/wrong1.mp3");

interface State {
    mode: GameModes,
    roundQuestion: RoundQuestion | null,
    vocabEntry: VocabEntry,
    player: Player
}

export default class MainApp extends React.Component<any, State> {

    private time: number = 15;
    private maxPoints: number = 20;
    private timeRemaining: number = 0;
    private bell: UIfx = new UIfx(bellAudio);
    private buzz: UIfx = new UIfx(buzzAudio);

    constructor(props: any) {
        super(props);

        this.state = {
            mode: GameModes.idle,
            roundQuestion: new RoundQuestion(),
            vocabEntry: new VocabEntry(),
            player: PlearnitService.player
        }
    }

    public componentDidMount(){
        PlearnitService.events.addEventListener(PlearnitEvents.PLAYER_UPDATED, (evt: any) => this.setState({player: evt.detail as Player}))
    }

    private getReady = (): void => {
        if (PlearnitService.questionIndex !== PlearnitService.round.questions.length) {
            this.updateMode(GameModes.getReady);
            window.setTimeout(this.giveWord, 3000);
        } else {
            this.gameOver();
        } 
    }

    private giveWord = (): void => {
        let roundQuestion: RoundQuestion | null = PlearnitService.getNextQuestion();

        this.setState({
            mode: GameModes.presentWord,
            roundQuestion: roundQuestion,
            vocabEntry: roundQuestion?.content_object as VocabEntry
        })
        // this.updateMode(new GameModeUpdate(GameModes.presentWord, {word}) );
    }

    private gameOver = (): void => {
        this.updateMode(GameModes.gameOver);
        PlearnitService.completeRound();
    }

    private onWordFound = (): void => {
        this.updateMode(GameModes.showCorrectWord);

        let points: number = Math.floor(this.maxPoints * (this.timeRemaining / this.time));

        PlearnitService.submitAnswer(this.state.vocabEntry.response_text, points, this.state.roundQuestion || new RoundQuestion());

        this.bell.play();

        window.setTimeout(this.getReady, 3000);
    }

    private startGame = () => {
        this.updateMode(GameModes.getReady);

        PlearnitService.loadRound()
            .then(() => {
                this.getReady();
            })
            .catch( err => window.alert('unable to load game'))
    }

    private updateMode = (newMode: GameModes) => {
        switch(newMode) {
            case GameModes.reveal:
                window.setTimeout(this.getReady, 3000);
                break;

        }
        this.setState({
            mode: newMode,
        });
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
                                    {this.state.player.total_score}
                                </div>
                                <div className="col-6" id="timer">
                                    <Timer
                                        time={this.time}
                                        mode={this.state.mode}
                                        timeRemaining={(time: number) => {
                                            this.timeRemaining = time;
                                            if (time === 0) {
                                                this.buzz.play();
                                                PlearnitService.submitAnswer('3432234', 0, this.state.roundQuestion || new RoundQuestion());
                                                this.updateMode(GameModes.reveal);
                                            }
                                        }}
                                        />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-6" id="the-word">
                            {
                                this.state.mode === GameModes.getReady ?
                                    'Get Ready!':
                                    this.state.mode === GameModes.presentWord ?
                                        this.state.vocabEntry.prompt_text
                                        :
                                        ''
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 text-center">
                            <Grid
                                mode={this.state.mode}
                                word={this.state.vocabEntry.response_text}
                                wordFound={this.onWordFound}
                                size={12}
                                allowedDirections={[WordDirections.E, WordDirections.SE, WordDirections.S]}
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
}