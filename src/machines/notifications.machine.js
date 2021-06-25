import { createMachine, spawn, assign, send } from 'xstate'
import { choreoMachine } from './Choreographer.machine'
import { browserStatusId } from './cogs/browserStatus.cog'

const notificationMessageDef = createMachine(
  {
    id: 'message',
    initial: 'running',
    context: {
      duration: 5000,
      elapsed: 0,
      interval: 250,
    },
    states: {
      running: {
        invoke: {
          id: 'counter',
          src: 'counter',
          onDone: {
            target: 'complete',
          },
        },
        on: {
          TICK: [
            {
              cond: 'hasExpired',
              target: 'complete',
            },
            {
              actions: 'updateDuration',
            },
          ],
        },
      },
      complete: {
        type: 'final',
      },
    },
  },
  {
    guards: {
      hasExpired: (ctx) => ctx.elapsed >= ctx.duration,
    },
    services: {
      counter: (ctx) => (cb) => {
        const interval = setInterval(() => {
          cb('TICK')
        }, ctx.interval)

        return () => clearInterval(interval)
      },
    },
    actions: {
      updateDuration: assign({
        duration: (ctx) => ctx.duration + ctx.interval,
      }),
    },
  },
)

export const notificationsMachineId = 'notifications'

export const notificationsMachineDef = createMachine(
  {
    id: notificationsMachineId,
    initial: 'idle',
    context: {
      appIsActive: true,
      queue: [],
    },
    on: {
      UPDATE_BROWSER_STATUS: {
        actions: (ctx, event) =>
          console.log('NOTIFICATIONS::Browser Status Updated', event),
      },
    },
    states: {
      idle: {
        entry: ['subscribeToBrowserUpdates'],
        on: {
          ADD_TO_QUEUE: {
            target: 'canShowMessages',
            actions: 'addItemToQueue',
          },
        },
      },
      canShowMessages: {
        always: [
          {
            cond: 'canShow',
            target: 'showingMessage',
          },
          {
            target: 'idle',
          },
        ],
      },
      showingMessage: {
        on: {
          ADD_TO_QUEUE: {
            actions: 'addItemToQueue',
          },
        },
      },
    },
  },
  {
    guards: {
      canShow: (ctx) => ctx.queue.length > 1 && ctx.appIsActive,
    },
    actions: {
      subscribeToBrowserUpdates: send(
        {
          type: 'SUBSCRIBE_TO_ACTOR',
          data: {
            actorId: browserStatusId,
          },
        },
        { to: choreoMachine },
      ),
      addItemToQueue: assign({
        queue: (ctx, event, meta) => {
          console.log('item added to queue', event, meta)
          return [...ctx.queue, spawn(notificationMessageDef)]
        },
      }),
    },
  },
)
