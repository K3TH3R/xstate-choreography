import { useInterpret } from '@xstate/vue'
import { assign, spawn, createMachine, interpret, send } from 'xstate'
import { respond, pure } from 'xstate/lib/actions'

export const choreographerMachineId = 'choreographer'

const choreographerMachineDef = createMachine(
  {
    id: choreographerMachineId,
    initial: 'listening',
    context: {
      actors: {},
    },
    on: {
      SPAWN_GLOBAL_ACTOR: {
        actions: ['spawnActor', 'respondWithActorRef'],
      },
      SUBSCRIBE_TO_ACTOR: {
        actions: ['addSubscriberToActor', 'respondToSubscriptionRequest'],
      },
      NOTIFY_SUBSCRIBERS: {
        actions: ['notifySubscribers'],
      },
    },
    states: {
      listening: {},
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
      respondWithActorRef: respond((ctx, { data }) => ({
        type: 'RETURN_ACTOR_REF',
        data: {
          ref: ctx.actors[data.id].ref,
          id: data.id,
        },
      })),
      addSubscriberToActor: assign({
        actors: ({ actors }, { data }, { _event }) => {
          const { origin } = _event
          const { actorId } = data
          const { ref, subscribers } = actors[actorId]

          return {
            ...actors,
            [actorId]: {
              ref: ref,
              subscribers: subscribers.length
                ? [...subscribers, origin]
                : [origin],
            },
          }
        },
      }),
      respondToSubscriptionRequest: respond('SUBSCRIBE_SUCCESSFUL'),
      notifySubscribers: pure(({ actors }, { publisherId, payload }) => {
        const { subscribers } = actors[publisherId]
        return subscribers.map((subscriber) =>
          send(payload, { to: subscriber }),
        )
      }),
    },
  },
)

// export const choreographerMachine = useInterpret(choreographerMachineDef)

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
