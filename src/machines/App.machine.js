import { assign, createMachine, send, spawn } from 'xstate'
import { pure } from 'xstate/lib/actions'
import {
  browserStatusMachine,
  browserStatusMachineId,
} from './browserStatus.machine'
import {
  notificationsMachine,
  notificationsMachineId,
} from './notifications.machine'
import { choreographerMachine } from './choreographer.machine'

export const appMachineId = 'appMachine'

export const appMachine = createMachine(
  {
    id: appMachineId,
    initial: 'idle',
    context: {
      actors: {},
    },
    states: {
      idle: {
        entry: ['setupActors', 'registerActors'],
      },
    },
  },
  {
    actions: {
      setupActors: assign({
        actors: () => ({
          [browserStatusMachineId]: spawn(
            browserStatusMachine,
            browserStatusMachineId,
          ),
          [notificationsMachineId]: spawn(
            notificationsMachine,
            notificationsMachineId,
          ),
        }),
      }),
      registerActors: pure((ctx) =>
        Object.entries(ctx.actors).map(([id, ref]) =>
          send(
            {
              type: 'REGISTER_ACTOR',
              data: { ref, id },
            },
            { to: choreographerMachine },
          ),
        ),
      ),
    },
  },
)
