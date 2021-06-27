import { createMachine } from 'xstate'

export const characterRefId = (id) => `character-${id}`

const state = {
  id: 'characterMachine',
  initial: 'idle',
  context: {},
  states: {
    idle: {},
  },
}

const options = {}

export const characterMachine = createMachine(state, options)
