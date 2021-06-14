import { assign, createMachine, interpret, spawn as _spawn } from 'xstate'

const state = {
  id: 'choreographer',
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
      },
    },
  },
}

const options = {
  guards: {},
  services: {},
  actions: {
    storeActorRef: assign({
      actors: (ctx, { data }) => {
        return {
          ...ctx.actors,
          [data.id]: data.ref,
        }
      },
    }),
  },
}

const choreoMachine = createMachine(state, options)

export const Choreo = interpret(choreoMachine).onTransition((state) => {
  // console.log('choreo actors', state.context.actors)
})

Choreo.start()

export const spawn = (actorDef, actorId) => {
  const ref = _spawn(actorDef, actorId)
  Choreo.send({
    type: 'REGISTER_ACTOR',
    data: { ref, id: actorId },
  })
  return ref
}
