import { assign, createMachine, forwardTo, send } from 'xstate'
import {
  browserStatusMachine,
  browserStatusMachineId,
} from './browserStatus.machine'
import {
  notificationsMachine,
  notificationsMachineId,
} from './notifications.machine'
import {
  choreographerMachine,
  registerActors,
  registerServiceWorker,
} from './choreographer.machine'
import { invokeWebWorker } from '../workers/invoke-worker'
import FetchWorker from '../workers/fetch-worker?worker'
import { fetchServiceWorkerId } from './ServiceWorkerIds'

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
      id: fetchServiceWorkerId,
      src: invokeWebWorker(new FetchWorker()),
    },
    on: {
      SEND_SERVICE_WORKER: {
        actions: ['forwardToWorker'],
      },
      NOTIFY_WORKER_SUBSCRIBERS: {
        actions: ['forwardToChoreographer'],
      },
    },
    states: {
      idle: {
        entry: ['registerFetchWorker', 'registerActors'],
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
        workerId: fetchServiceWorkerId,
      }),
      forwardToWorker: send(
        (_ctx, { payload }) => ({
          ...payload,
        }),
        { to: (_ctx, { workerId }) => workerId },
      ),
      forwardToChoreographer: forwardTo(choreographerMachine),
    },
  },
)
