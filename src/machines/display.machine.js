import { createMachine, assign, send } from 'xstate'

export const displayMachineId = 'display'

export const displayMachine = createMachine(
  {
    id: displayMachineId,
    context: {
      counter: 0,
      updatedAt: new Date(Date.now()).toISOString(),
      msg: null,
    },
    on: {
      UPDATED_BROWSER_STATUS: {
        actions: ['storeUpdatedBrowserStatus'],
      },
      UPDATED_COUNTER: {
        actions: ['storeUpdatedCount'],
      },
    },
  },
  {
    actions: {
      storeUpdatedBrowserStatus: assign({
        msg: (_ctx, { data }) => {
          let msg = `The browser is currently online`

          if (!(data.online && data.visible && data.focused)) {
            msg = `The browser is offline or not currently focused`
          }

          return msg
        },
      }),
      storeUpdatedCount: assign({
        counter: (_, { data }) => data.count,
        updatedAt: (_, { data }) => data.updatedAt,
      }),
    },
  },
)
