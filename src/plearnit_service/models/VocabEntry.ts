import BaseModel from "./BaseModel";

export default class VocabEntry extends BaseModel {
    public prompt_text: string = '';
    public response_text: string = '';
    public image: string = '';
}