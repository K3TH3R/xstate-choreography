import {
  assign,
  createMachine,
  interpret,
  spawn as _spawn,
  actions,
  send,
} from 'xstate'

const { pure } = actions

export const choreoMachineId = 'choreographer'

const choreoMachineDef = createMachine(
  {
    id: choreoMachineId,
    initial: 'idle',
    context: {
      actors: {},
      queue: [],
    },
    states: {
      on: {
        REGISTER_ACTOR: {
          actions: ['storeActorRef'],
        },
        NOTIFY_SUBSCRIBERS: {
          actions: ['notifySubscribers'],
        },
      },
      idle: {
        on: {
          SUBSCRIBE_TO_ACTOR: {
            target: 'processingQueue',
            actions: ['addSubscriptionToQueue'],
          },
        },
      },
      processingQueue: {
        on: {
          SUBSCRIBE_TO_ACTOR: {
            actions: ['addSubscriptionToQueue'],
          },
        },
        invoke: {
          src: 'processOldestItemInQueue',
          onDone: {
            target: 'checkingIfThereAreItemsInQueue',
            actions: ['removeOldestItemInQueue'],
          },
          onError: {
            target: 'awaitingRetry',
          },
        },
      },
      awaitingRetry: {
        on: {
          SUBSCRIBE_TO_ACTOR: {
            actions: ['addSubscriptionToQueue'],
          },
        },
        after: {
          500: 'processingQueue',
        },
      },
      checkingIfThereAreItemsInQueue: {
        on: {
          SUBSCRIBE_TO_ACTOR: {
            actions: ['addSubscriptionToQueue'],
          },
        },
        always: [
          {
            cond: 'hasItemsInQueue',
            target: 'processingQueue',
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
      hasItemsInQueue: (ctx) => ctx.queue.length > 0,
    },
    services: {},
    actions: {
      storeActorRef: assign({
        actors: (ctx, { data }) => {
          if (ctx.actors[data.id]) {
            return {
              ...ctx.actors,
              [data.id]: {
                subscribers: [...ctx.actors[data.id].subscribers],
                ref: data.ref,
              },
            }
          }
          return {
            ...ctx.actors,
            [data.id]: {
              subscribers: [],
              ref: data.ref,
            },
          }
        },
      }),
      addSubscriptionToQueue: assign({
        queue: (ctx, { data }, { _event }) => {
          console.log('addtoSubscriptionQueue', {
            type: 'subscription',
            actorId: data.actorId,
            origin: _event.origin,
            attempts: 0,
          })
          return [
            ...ctx.queue,
            {
              type: 'subscription',
              actorId: data.actorId,
              origin: _event.origin,
            },
          ]
        },
      }),
      storeActorSubscription: assign({
        actors: (ctx, { data }, { _event }) => {
          const subscriberOrigin = _event.origin
          console.log(
            'storeActorSubscription',
            data.actorId,
            ctx.actors[data.actorId],
          )
          const subscribers = ctx.actors[data.actorId].subscribers
          const updatedActor = {
            subscribers: subscribers.length
              ? [...ctx.actors[data.actorId].subscribers, subscriberOrigin]
              : [subscriberOrigin],
            ref: ctx.actors[data.actorId].ref,
          }

          return {
            ...ctx.actors,
            [data.actorId]: { ...updatedActor },
          }
        },
      }),
      notifySubscribers: pure((ctx, event) => {
        const publisher = event.publisherId
        const subscribers = ctx.actors[publisher].subscribers
        const payload = event.payload
        return subscribers.map((subscriber) => {
          return send(payload, { to: subscriber })
        })
      }),
    },
  },
)

export const choreoMachine = interpret(choreoMachineDef)
  .onTransition((state) => {
    // console.log('choreo actors', state.context.actors)
  })
  .start()

export const spawn = (actorDef, actorId) => {
  const ref = _spawn(actorDef, actorId)
  choreoMachine.send({
    type: 'REGISTER_ACTOR',
    data: { ref, id: actorId },
  })
  return ref
}

export const getActor = (actorId) => {}
choreoMachine.state.context.actors[actorId].ref
