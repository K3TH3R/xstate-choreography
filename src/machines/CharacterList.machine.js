import { assign, createMachine } from 'xstate'
import { spawn } from './Choreographer.machine'
import { characterMachine, characterRefId } from './Character.machine'

export const characterListRefId = 'rnm-sidebar'

const state = {
  id: characterListRefId,
  initial: 'idle',
  context: {
    characters: {},
  },
  states: {
    idle: {
      on: {
        RECEIVE_CHARACTERS: {
          target: 'running',
          actions: ['createCharacterActors'],
        },
      },
    },
    running: {},
  },
}

const options = {
  guards: {},
  services: {},
  actions: {
    createCharacterActors: assign({
      characters: (ctx, { data }) =>
        data.results.reduce((acc, character) => {
          const refId = characterRefId(character.id)
          const characterActor = spawn(
            characterMachine.withContext({ ...character }),
            refId,
          )
          acc[refId] = characterActor
          return acc
        }, {}),
    }),
  },
}

export const characterListMachine = createMachine(state, options)
