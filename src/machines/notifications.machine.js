import { sendParent, createMachine, assign, spawn, send } from 'xstate'
import { browserStatusMachineId } from './browserStatus.machine'
import { choreographerMachine } from './choreographer.machine'

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
        DISMISS: 'complete',
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
      entry: sendParent('NOTIFICATION_DONE'),
    },
  },
})

export const notificationsMachineId = 'notifications'

export const notificationsMachine = createMachine(
  {
    id: notificationsMachineId,
    initial: 'boot',
    context: {
      queue: [],
      showing: [],
    },
    invoke: {
      src: () => (sendSelf) => {
        function blitzNotifications() {
          let count = 0
          const blitzInterval = setInterval(() => {
            sendSelf({
              type: 'ADD_TO_QUEUE',
              data: {
                msg: 'This is a new message',
                createdAt: Date.now(),
                type: Math.random() > 0.5 ? 'success' : 'error',
              },
            })
            if (++count >= 5) {
              console.log('blitz cleared')
              clearInterval(blitzInterval)
            }
          }, 1000)
        }

        blitzNotifications()
        // const minuteInterval = setInterval(() => {
        //   blitzNotifications()
        // }, 60000)

        // return () => clearInterval(minuteInterval)
      },
    },
    states: {
      boot: {
        entry: ['subscribeToBrowserStatusActor'],
        on: {
          SUBSCRIBE_SUCCESSFUL: {
            target: 'idle',
          },
        },
      },
      idle: {
        entry: () => console.log('notifications idle'),
        on: {
          ADD_TO_QUEUE: {
            target: 'spawnNotification',
            actions: 'addItemToQueue',
          },
          NOTIFICATION_DONE: [
            {
              cond: 'hasItemsInQueue',
              target: 'spawnNotification',
              actions: ['removeOldestNotification'],
            },
            {
              actions: ['removeOldestNotification'],
            },
          ],
          UPDATED_BROWSER_STATUS: {
            target: 'spawnNotification',
            actions: [
              'createBrowserStatusNotification',
              () => console.log('idle::UPDATED_BROWSER_STATUS CAUGHT'),
            ],
          },
        },
      },
      spawnNotification: {
        entry: ['showOldestItemInQueue', 'removeOldestItemFromQueue'],
        always: [
          {
            cond: 'isShowingMaxAllowedItems',
            target: 'waitToShowNextItem',
          },
          {
            cond: 'hasItemsInQueue',
            target: 'spawnNotification',
          },
          {
            target: 'idle',
          },
        ],
      },
      waitToShowNextItem: {
        on: {
          ADD_TO_QUEUE: {
            actions: ['addItemToQueue'],
          },
          UPDATED_BROWSER_STATUS: {
            actions: [
              'createBrowserStatusNotification',
              () =>
                console.log(
                  'waitToShowNextItem::UPDATED_BROWSER_STATUS CAUGHT',
                ),
            ],
          },
          NOTIFICATION_DONE: [
            {
              cond: 'hasItemsInQueue',
              target: 'spawnNotification',
              actions: ['removeOldestNotification'],
            },
            {
              target: 'idle',
              actions: ['removeOldestNotification'],
            },
          ],
        },
      },
    },
  },
  {
    guards: {
      isShowingMaxAllowedItems: (ctx) => ctx.showing.length > 1,
      hasItemsInQueue: (ctx) => ctx.queue.length > 0,
    },
    services: {},
    actions: {
      subscribeToBrowserStatusActor: send(
        {
          type: 'SUBSCRIBE_TO_ACTOR',
          data: {
            actorId: browserStatusMachineId,
          },
        },
        { to: choreographerMachine },
      ),
      addItemToQueue: assign({
        queue: (ctx, { data }) => [...ctx.queue, { ...data }],
      }),
      removeOldestItemFromQueue: assign({
        queue: (ctx) => {
          const [, ...newQueue] = ctx.queue
          return newQueue
        },
      }),
      showOldestItemInQueue: assign({
        showing: (ctx) => [
          ...ctx.showing,
          spawn(
            notificationMessageDef.withContext({
              ...notificationMessageDef.context,
              message: { ...ctx.queue[0] },
            }),
          ),
        ],
      }),
      removeOldestNotification: assign({
        showing: (ctx, event) => {
          ctx.showing[0].stop()
          return ctx.showing.length === 2 ? [ctx.showing[1]] : []
        },
      }),
      createBrowserStatusNotification: assign({
        queue: (ctx, { data }) => {
          let msg = 'The browser is active and online'
          let type = 'success'

          if (!data.online) {
            msg = 'The network appears to be down'
            type = 'error'
          } else if (!data.visible) {
            msg = 'The browser is not currently visible'
            type = 'warning'
          } else if (!data.focused) {
            msg = 'The browser is not currently focused'
            type = 'warning'
          }

          return [
            ...ctx.queue,
            {
              msg,
              type,
              createdAt: Date.now(),
            },
          ]
        },
      }),
    },
  },
)
