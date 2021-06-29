import { assign, spawn, createMachine, interpret, send } from 'xstate'
import { respond, pure } from 'xstate/lib/actions'

export const choreographerMachineId = 'choreographer'

const choreographerMachineDef = createMachine(
  {
    id: choreographerMachineId,
    initial: 'idle',
    context: {
      actors: {},
    },
    on: {
      SPAWN_GLOBAL_ACTOR: {
        actions: ['spawnActor', 'returnActor'],
      },
    },
    states: {
      idle: {},
    },
  },
  {
    actions: {
      spawnActor: assign({
        actors: (ctx, { data }) => {
          return {
            ...ctx.actors,
            [data.id]: {
              subscribers: [],
              ref: spawn(data.def, data.id),
            },
          }
        },
      }),
      returnActor: respond((ctx, { data }) => ({
        type: 'RETURN_ACTOR_REF',
        data: {
          ref: ctx.actors[data.id].ref,
          id: data.id,
        },
      })),
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

export const registerActors = (actorConfig) =>
  pure(() =>
    actorConfig.map(({ def, id }) =>
      send(
        {
          type: 'SPAWN_GLOBAL_ACTOR',
          data: { def, id },
        },
        { to: choreographerMachine },
      ),
    ),
  )
