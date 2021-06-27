import { createMachine, spawn, assign, send } from 'xstate'

const notificationMessageDef = createMachine({
  id: 'message',
  initial: 'running',
  context: {
    duration: 5000,
    timerWidth: 0,
    elapsed: 0,
    interval: 100,
    message: null,
  },
  states: {
    running: {
      invoke: {
        src: (ctx) => (sendSelf) => {
          const interval = setInterval(() => {
            sendSelf('TICK')
          }, ctx.interval)

          return () => clearInterval(interval)
        },
      },
      on: {
        TICK: [
          {
            cond: (ctx) => ctx.elapsed >= ctx.duration,
            target: 'complete',
          },
          {
            actions: assign({
              elapsed: (ctx) => ctx.elapsed + ctx.interval,
              timerWidth: (ctx) => 100 - (ctx.elapsed / ctx.duration) * 100,
            }),
          },
        ],
      },
    },
    complete: {
      type: 'final',
    },
  },
})

export const notificationsMachineId = 'notifications'

export const notificationsMachine = createMachine(
  {
    id: notificationsMachineId,
    initial: 'idle',
    context: {
      queue: [],
      shown: [],
    },
    invoke: {
      src: (ctx) => (sendSelf) => {
        function blitzNotifications() {
          let count = 0
          const blitzInterval = setInterval(() => {
            sendSelf({
              type: 'ADD_TO_QUEUE',
              data: {
                msg: 'This is a new message',
                createdAt: Date.now(),
              },
            })
            if (++count >= 5) {
              console.log('blitz cleared')
              clearInterval(blitzInterval)
            }
          }, 1000)
        }

        blitzNotifications()
        const minuteInterval = setInterval(() => {
          blitzNotifications()
        }, 60000)

        return () => clearInterval(minuteInterval)
      },
    },
    states: {
      idle: {
        on: {
          ADD_TO_QUEUE: {
            target: 'showNotification',
            actions: 'addItemToQueue',
          },
        },
      },
      showNotification: {
        on: {
          ADD_TO_QUEUE: {
            actions: 'addItemToQueue',
          },
        },
        invoke: {
          src: 'showOldestItemInQueue',
          onDone: {
            target: 'checkForRemainingItems',
            actions: ['removeOldestItemInQueue'],
          },
          onError: {
            target: 'awaitingRetry',
          },
        },
      },
      awaitingRetry: {
        on: {
          ADD_TO_QUEUE: {
            target: 'showNotification',
            actions: 'addItemToQueue',
          },
        },
        after: {
          1000: 'showNotification',
        },
      },
      checkForRemainingItems: {
        on: {
          ADD_TO_QUEUE: {
            actions: 'addItemToQueue',
          },
        },
        always: [
          {
            cond: 'hasRemainingItems',
            target: 'showNotification',
          },
          {
            target: 'idle',
          },
        ],
      },
    },
  },
  {
    guards: {
      hasRemainingItems: (ctx) => ctx.queue.length > 0,
    },
    services: {
      showOldestItemInQueue: (ctx) =>
        notificationMessageDef.withContext({
          ...notificationMessageDef.context,
          message: { ...ctx.queue[0] },
        }),
    },
    actions: {
      addItemToQueue: assign({
        queue: (ctx, { data }) => {
          return [
            ...ctx.queue,
            {
              ...data,
              receivedAt: Date.now(),
            },
          ]
        },
      }),
      removeOldestItemInQueue: assign({
        queue: (ctx) => {
          const [, ...newQueue] = ctx.queue
          return newQueue
        },
      }),
    },
  },
)
