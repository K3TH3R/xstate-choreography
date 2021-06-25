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
    initial: 'listening',
    context: {
      actors: {},
    },
    states: {
      listening: {
        on: {
          REGISTER_ACTOR: {
            actions: ['storeActorRef'],
          },
          SUBSCRIBE_TO_ACTOR: {
            actions: [
              'storeActorSubscription',
              (ctx) => console.log('subscribe', ctx.actors),
            ],
          },
          NOTIFY_SUBSCRIBERS: {
            actions: [
              //'notifySubscribers'
              (ctx) => console.log('notify', ctx),
            ],
          },
        },
      },
    },
  },
  {
    guards: {},
    services: {},
    actions: {
      storeActorRef: assign({
        actors: (ctx, { data }) => {
          return {
            ...ctx.actors,
            [data.id]: {
              subscribers: [],
              ref: data.ref,
            },
          }
        },
      }),
      storeActorSubscription: assign({
        actors: (ctx, { data }, { _event }) => {
          const subscriberOrigin = _event.origin
          const updatedActor = {
            subscribers: [
              ...ctx.actors[data.actorId].subscribers,
              subscriberOrigin,
            ],
            ref: ctx.actors[data.actorId].ref,
          }
          console.log('storing subscription', updatedActor)

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

export const choreoMachine = interpret(choreoMachineDef).onTransition(
  (state) => {
    // console.log('choreo actors', state.context.actors)
  },
)

choreoMachine.start()

export const spawn = (actorDef, actorId) => {
  const ref = _spawn(actorDef, actorId)
  choreoMachine.send({
    type: 'REGISTER_ACTOR',
    data: { ref, id: actorId },
  })
  return ref
}
