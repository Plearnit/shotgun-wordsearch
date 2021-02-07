import React, {useState} from 'react';

import MainApp from './components/main_app/MainApp';
import Plearnit from './plearnit_service/PlearnitService';
import Player from './plearnit_service/models/Player';

import './App.css';
import {config} from "./config";
import {GameStages} from "./constants";
import {Instructions} from "./components/instructions/Instructions";

export const App = (): React.ReactElement => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [gameStage, setGameStage] = useState(GameStages.playing)

  React.useEffect(() => {
    let playerUUID: string = process.env.NODE_ENV === 'development' ?
        config.PLAYER_UUID : new URL(window.location.href).searchParams.get('plyr') || ''

    Plearnit.login(playerUUID)
        .then((player: Player) => {
          setLoggedIn(true);
        })
        .catch( err => window.alert('unable to login.'))
  }, [])

  return (
      <div className='container-fluid'>
        <div className='row justify-content-center'>
          <div className='col-12 col-md-7'>
            {gameStage === GameStages.instructions &&
                <Instructions completed={() => setGameStage(GameStages.playing)} />
            }
            {gameStage === GameStages.playing &&
                <MainApp />
            }
          </div>
        </div>
      </div>
  )
}
