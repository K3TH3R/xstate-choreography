import { createMachine, assign, send } from 'xstate'
import { displayMachineId } from './display.machine'
import { choreographerMachine } from './choreographer.machine'

export const counterMachineId = 'counter'

export const counterMachine = createMachine(
  {
    id: counterMachineId,
    context: {
      counter: null,
    },
    on: {
      UPDATED_BROWSER_STATUS: {
        actions: ['updatedBrowserStatus', 'sendDisplayActor'],
      },
    },
  },
  {
    actions: {
      updatedBrowserStatus: assign({
        counter: (ctx) => ctx.counter + 1,
      }),
      sendDisplayActor: send(
        (ctx) => ({
          type: 'SEND_TO_ACTOR',
          actorId: displayMachineId,
          payload: {
            type: 'UPDATED_COUNTER',
            data: {
              count: ctx.counter,
              updatedAt: new Date(Date.now()).toISOString(),
            },
          },
        }),
        { to: choreographerMachine },
      ),
    },
  },
)
