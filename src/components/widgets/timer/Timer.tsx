import React, {useRef, useState} from 'react';

import './timer.css';
import {GameModes} from "../../../constants";

interface Props {
    mode: GameModes,
    time: number,
    timeRemaining: (time: number) => void
}

export const Timer = (props: Props): React.ReactElement => {

    let clock: number = 0;

    const [time, setTime] = useState(0);

    const countRef = useRef<number>(time);
    countRef.current = time;

    React.useEffect(() => {
        switch(props.mode) {
            case GameModes.idle:
                clearInterval(clock);
                break;

            case GameModes.presentWord:
                clock = window.setInterval(onInterval, 1000);
                break;

            case GameModes.getReady:
                setTime(props.time);

            default:
                clearInterval(clock);
        }

        return() => {
            clearInterval(clock);
        }
    }, [props.mode])


    const onInterval = () => {
        const t: number = countRef.current - 1;
        setTime(t);
        props.timeRemaining(t);

        if (t === 0)
            clearInterval(clock);
    }

    const minutes: number =  ~~(time / 60);
    const seconds: number = time - (minutes * 60);

    return (
        <div className="timer">
            {
                minutes > 0 ? `${minutes}:${seconds}` : seconds
            }
        </div>
    )
}