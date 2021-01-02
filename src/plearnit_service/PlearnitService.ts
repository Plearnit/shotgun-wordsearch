import {Service} from './service/Service';
import Round from './models/Round';
import SubmitAnswerDTO from "./dto/SubmitAnswerDTO";
import RoundQuestion from "./models/RoundQuestion";
import Player from "./models/Player";
import SubmitAnswerResponseDTO from "./dto/SubmitAnswerResponseDTO";
import EventHandler from "./EventHandler";

export enum PlearnitEvents {
    PLAYER_UPDATED= 'PLAYER_UPDATED'
}

export class PlearnitService extends Service {

    public player: Player = new Player();

    public round: Round = new Round();
    public questionIndex: number = 0;
    public events: EventHandler = new EventHandler();

    public completeRound = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            this._get(`complete_round/${this.round.uuid}`)
                .then(() => resolve())
                .catch( err => reject(err))
        })
    }

    public getNextQuestion = (): RoundQuestion | null => {
        if (this.questionIndex === this.round.questions.length)
            return null;

        this.questionIndex ++;
        return this.round.questions[this.questionIndex -1];
    }

    public loadRound = (): Promise<Round> => {
        return new Promise((resolve, reject) => {
            this._get<Round>(`get_round/${this.player.uuid}`)
                .then((round: Round) => {
                    this.round = round;
                    this.questionIndex = 0;
                    resolve(round)
                })
                .catch( err => reject(err))
        })
    }

    public login = (playerUUID: string): Promise<Player> => {
        return new Promise((resolve, reject) => {
            this._get<Player>(`login/${playerUUID}`)
                .then((player: Player) => {
                    this.updatePlayer(player);
                    resolve();
                })
                .catch( err => reject(err))
        })
    }

    public submitAnswer = (answer: string, score: number, roundQuestion: RoundQuestion): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._post<SubmitAnswerResponseDTO>(`submit_answer/${this.player.uuid}`, new SubmitAnswerDTO(answer, score, roundQuestion))
                .then((response: SubmitAnswerResponseDTO) => {
                    this.updatePlayer(response.player);
                    resolve(response.is_correct);
                })
                .catch( err => reject(err))
        })
    }

    private updatePlayer = (player: Player): void => {
        this.player = player;
        this.events.fireEvent(new CustomEvent(PlearnitEvents.PLAYER_UPDATED, {detail: player}));
    }
}

export default new PlearnitService()