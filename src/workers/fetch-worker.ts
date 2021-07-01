import { createMachine, sendParent } from 'xstate'
import { interpretInWorker } from './invoke-worker'
import { fetchServiceWorkerId } from '../machines/ServiceWorkerIds'

const fetchWorkerMachine = createMachine(
  {
    id: fetchServiceWorkerId,
    initial: 'online',
    on: {
      UPDATED_BROWSER_STATUS: [
        {
          cond: 'isOnline',
          target: 'online',
          actions: [
            'sendOnlineNotification',
            () => console.log('sendOnlineNotification', Date.now()),
          ],
        },
        {
          target: 'offline',
          actions: [
            'sendOfflineNotification',
            () => console.log('sendOfflineNotification', Date.now()),
          ],
        },
      ],
    },
    states: {
      online: {},
      offline: {},
    },
  },
  {
    guards: {
      isOnline: (_ctx, { data }) => data.online && data.visible && data.focused,
    },
    actions: {
      sendOnlineNotification: sendParent(() => ({
        type: 'NOTIFY_WORKER_SUBSCRIBERS',
        publisherId: fetchServiceWorkerId,
        payload: {
          type: 'UPDATED_FETCHER_STATUS',
          data: {
            msg: 'WORKER:: Fetch is Online',
            type: 'success',
            createdAt: Date.now(),
          },
        },
      })),
      sendOfflineNotification: sendParent(() => ({
        type: 'NOTIFY_WORKER_SUBSCRIBERS',
        publisherId: fetchServiceWorkerId,
        payload: {
          type: 'UPDATED_FETCHER_STATUS',
          data: {
            msg: 'WORKER:: Fetch is Offline',
            type: 'error',
            createdAt: Date.now(),
          },
        },
      })),
    },
  },
)

const service = interpretInWorker(fetchWorkerMachine)
service.start()
