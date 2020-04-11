export enum GameModes {
    idle,
    presentWord,
    pause,
    reveal
}

export default class GameModeUpdate {
    constructor(public mode: GameModes, public payload?: any) { }
}