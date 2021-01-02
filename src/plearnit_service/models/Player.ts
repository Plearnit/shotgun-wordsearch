import BaseModel from "./BaseModel";

export default class Player extends BaseModel {
    public name: string = '';
    public score: number = 0;
    public total_score: number = 0;
    public uuid: string = '';
}