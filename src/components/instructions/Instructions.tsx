import React from 'react';
import {Connecting} from "../connect/Connecting";

interface Props {
    completed: () => void
}

export const Instructions = (props: Props): React.ReactElement => {

    return(
        <Connecting />
    )
}