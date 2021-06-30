import { assign, createMachine } from 'xstate'
import {
  browserStatusMachine,
  browserStatusMachineId,
} from './browserStatus.machine'
import {
  notificationsMachine,
  notificationsMachineId,
} from './notifications.machine'
import { registerActors, registerServiceWorker } from './choreographer.machine'
import { invokeWebWorker } from '../workers/invoke-worker'
import FetchWorker from '../workers/fetch-worker?worker'

export const appMachineId = 'appMachine'

const actorConfig = [
  {
    def: browserStatusMachine,
    id: browserStatusMachineId,
  },
  {
    def: notificationsMachine,
    id: notificationsMachineId,
  },
]

export const appMachine = createMachine(
  {
    id: appMachineId,
    initial: 'idle',
    context: {
      actors: {},
    },
    invoke: {
      id: 'fetchServiceWorker',
      src: invokeWebWorker(new FetchWorker()),
    },
    states: {
      idle: {
        entry: ['registerActors', 'registerFetchWorker'],
        on: {
          RETURN_ACTOR_REF: {
            actions: ['storeActorRef'],
          },
        },
      },
    },
  },
  {
    actions: {
      registerActors: registerActors(actorConfig),
      storeActorRef: assign({
        actors: (ctx, { data }) => ({
          ...ctx.actors,
          [data.id]: data.ref,
        }),
      }),
      registerFetchWorker: registerServiceWorker({
        workerId: 'fetchServiceWorker',
      }),
    },
  },
)
