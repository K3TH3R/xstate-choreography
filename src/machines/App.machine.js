import { assign, createMachine } from 'xstate'
import {
  browserStatusMachine,
  browserStatusMachineId,
} from './browserStatus.machine'
import {
  notificationsMachine,
  notificationsMachineId,
} from './notifications.machine'
import { registerActors } from './choreographer.machine'

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
    states: {
      idle: {
        entry: ['registerActors'],
        on: {
          RETURN_ACTOR_REF: {
            actions: ['storeActorRef', (ctx) => console.log('RETURNED', ctx)],
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
    },
  },
)
