import { createMachine, sendParent } from 'xstate'
import { interpretInWorker } from './invoke-worker'

const fetchWorkerMachine = createMachine({
  id: 'pong',
  on: {
    PING: {
      actions: [sendParent('PONG', { delay: 1000 }), () => console.log('PING')],
    },
  },
})

const service = interpretInWorker(fetchWorkerMachine)
service.start()
