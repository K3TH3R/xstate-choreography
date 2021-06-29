import { assign, createMachine } from 'xstate'
import { send, pure } from 'xstate/lib/actions'
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
    initial: 'boot',
    context: {
      actors: {},
    },
    states: {
      boot: {
        entry: ['registerActors'],
        on: {
          RETURN_ACTOR_REF: {
            target: 'canStart',
            actions: 'storeActorRef',
          },
        },
      },
      canStart: {
        always: [
          {
            cond: 'hasSpawnedAllActors',
            target: 'started',
          },
          {
            target: 'boot',
          },
        ],
      },
      started: {
        entry: ['startActors'],
      },
    },
  },
  {
    guards: {
      hasSpawnedAllActors: ({ actors }) =>
        Object.keys(actors).length === actorConfig.length,
    },
    actions: {
      registerActors: registerActors(actorConfig),
      storeActorRef: assign({
        actors: (ctx, { data }) => ({
          ...ctx.actors,
          [data.id]: data.ref,
        }),
      }),
      startActors: pure(({ actors }) =>
        Object.entries(actors).map(([, ref]) => send('START', { to: ref })),
      ),
    },
  },
)
