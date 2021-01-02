import BaseModel from "./BaseModel";
import VocabEntry from "./VocabEntry";
import TriviaQuestion from "./TriviaQuestion";
import MathGenProblem from "./MathGenProblem";

export default class RoundQuestion extends BaseModel {
    public content_object: VocabEntry | TriviaQuestion | MathGenProblem = new TriviaQuestion();
}