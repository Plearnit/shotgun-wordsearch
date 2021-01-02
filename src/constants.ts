export enum GameModes {
    idle,
    presentWord,
    pause,
    reveal,
    gameOver,
    getReady,
    showCorrectWord
}

export default class GameModeUpdate {
    constructor(public mode: GameModes, public payload?: any) { }
}