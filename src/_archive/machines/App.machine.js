import { assign, createMachine, forwardTo, send, spawn } from 'xstate'
import { invokeWebWorker } from '../workers/invoke-worker'
import FetcherWorker from '../workers/fetcher?worker'
import {
  characterListMachine,
  characterListRefId,
} from './CharacterList.machine'
import { browserStatusCogDef, browserStatusId } from './cogs/browserStatus.cog'
import {
  notificationsMachineId,
  notificationsMachineDef,
} from './notifications.machine'
import { pure } from 'xstate/lib/actions'
import { choreoMachine } from './Choreographer.machine'

export const appMachineId = 'appMachine'

export const appMachineDef = createMachine(
  {
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
        entry: ['setupActors', 'registerActors'],
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
  },
  {
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
      registerActors: pure((ctx) => {
        return Object.entries(ctx.actors).map(([id, ref]) =>
          send(
            {
              type: 'REGISTER_ACTOR',
              data: { ref, id },
            },
            { to: choreoMachine },
          ),
        )
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
  },
)
