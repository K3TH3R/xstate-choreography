import { assign, createMachine, interpret, spawn as _spawn } from 'xstate'

export const choreoMachineId = 'choreographer'

const state = {
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

const choreoMachineDef = createMachine(state, options)

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
