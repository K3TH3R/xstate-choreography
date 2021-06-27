import { assign, spawn as _spawn, createMachine, interpret } from 'xstate'

export const choreographerMachineId = 'choreographer'

const choreographerMachineDef = createMachine(
  {
    id: choreographerMachineId,
    initial: 'idle',
    context: {
      actors: {},
    },
    on: {
      REGISTER_ACTOR: {
        actions: ['storeActorRef'],
      },
    },
    states: {
      idle: {},
    },
  },
  {
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
    },
  },
)

export const choreographerMachine = interpret(choreographerMachineDef)
  .onTransition((state) => {
    if (state.changed) {
      // console.log('choreo actors', state.context.actors)
    }
  })
  .start()

export const getActor = (actorId) =>
  choreographerMachine.state.context.actors[actorId].ref
