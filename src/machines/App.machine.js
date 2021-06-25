import { assign, createMachine, forwardTo, send } from 'xstate'
import { invokeWebWorker } from '../workers/invoke-worker'
import FetcherWorker from '../workers/fetcher?worker'
import { spawn } from './Choreographer.machine'
import {
  characterListMachine,
  characterListRefId,
} from './CharacterList.machine'
import { browserStatusCogDef, browserStatusId } from './cogs/browserStatus.cog'
import {
  notificationsMachineId,
  notificationsMachineDef,
} from './notifications.machine'

export const appMachineId = 'appMachine'

const state = {
  id: appMachineId,
  initial: 'idle',
  context: {
    actors: {},
  },
  invoke: {
    id: 'fetcher',
    src: invokeWebWorker(new FetcherWorker()),
  },
  states: {
    idle: {
      entry: ['setupActors'],
      on: {
        LOGIN: {
          actions: [(ctx, e) => console.log('LOGIN RECEIVED', e)],
        },
        INIT: {
          target: 'loading',
          actions: ['init', 'fetchCharacters'],
        },
      },
    },
    loading: {
      on: {
        RECEIVE_CHARACTERS: {
          target: 'running',
          actions: ['forwardToCharacterList'],
        },
      },
    },
    running: {},
  },
}

const options = {
  guards: {},
  services: {},
  actions: {
    setupActors: assign({
      actors: (ctx) => ({
        [browserStatusId]: spawn(browserStatusCogDef, browserStatusId),
        [notificationsMachineId]: spawn(
          notificationsMachineDef,
          notificationsMachineId,
        ),
      }),
    }),
    init: assign({
      actors: (ctx) => ({
        ...ctx.actors,
        characterList: spawn(characterListMachine, characterListRefId),
      }),
    }),
    fetchCharacters: send({ type: 'FETCH_CHARACTERS' }, { to: 'fetcher' }),
    forwardToCharacterList: forwardTo(characterListRefId),
  },
}

export const appMachineDef = createMachine(state, options)
