import BaseModel from "./BaseModel";
import {MathGenFunctions} from "../consonants";

export default class MathGenProblem extends BaseModel {
    public function: MathGenFunctions = MathGenFunctions.addition;
    public rows: string = ''; // JSON encoded string : [ ##, ## ]
    public answer: string = ''; // answers are a string to accommodate answers that are not strictly numeric. ex; division can return 10 r 3
}