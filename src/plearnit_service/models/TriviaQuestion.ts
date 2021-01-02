import BaseModel from "./BaseModel";
import TriviaAnswer from "./TriviaAnswer";

export default class TriviaQuestion extends BaseModel {
    public text: string = '';
    public image: string = '';
    public is_true_false: boolean = false;
    public true_false_answer: boolean = true;

    public correct_answer: TriviaAnswer = new TriviaAnswer();
    public answers: TriviaAnswer[] = [];
}