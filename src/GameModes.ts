export enum GameModes {
    idle,
    presentWord,
    pause,
    reveal,
    gameOver,
    getReady,
    reset
}

export default class GameModeUpdate {
    constructor(public mode: GameModes, public payload?: any) { }
}