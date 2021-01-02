import RoundQuestion from "../models/RoundQuestion";

export default class SubmitAnswerDTO {
    public answer: string = '';
    public score: number = 0;
    public round_question_id: number = -1;

    constructor(
        answer: string,
        score: number,
        roundQuestion: RoundQuestion
    ) {
        this.answer = answer;
        this.score = score;
        this.round_question_id = roundQuestion.id
    }
}