import React, {useState} from 'react';

import MainApp from './components/MainApp';
import Plearnit from './plearnit_service/PlearnitService';
import Player from './plearnit_service/models/Player';

import './App.css';
import {config} from "./config";

export const App = (): React.ReactElement => {

  const [loggedIn, setLoggedIn] = useState(false);

  React.useEffect(() => {
    let playerUUID: string = process.env.NODE_ENV === 'development' ?
        config.PLAYER_UUID : new URL(window.location.href).searchParams.get('plyr') || ''

    Plearnit.login(playerUUID)
        .then((player: Player) => {
          setLoggedIn(true);
        })
        .catch( err => window.alert('unable to login.'))
  }, [])

  if (!loggedIn)
    return(
        <div>connecting...</div>
    )

  return (
    <MainApp />
  );
}
