import BaseModel from "./BaseModel";
import RoundQuestion from "./RoundQuestion";

export default class Round extends BaseModel {
    public uuid: string = '';
    public questions: RoundQuestion[] = [];
}