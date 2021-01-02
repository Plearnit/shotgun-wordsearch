import Player from "../models/Player";

export default class SubmitAnswerResponseDTO {
    public is_correct: boolean = false;
    public player: Player = new Player();
}