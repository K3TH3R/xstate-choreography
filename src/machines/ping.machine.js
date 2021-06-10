const pingMachine = createMachine({
  id: 'ping',
  invoke: {
    id: 'pong',
    src: invokeWebWorker(new FetcherWorker()),
  },
  entry: send({ type: 'PING' }, { to: 'pong' }),
  on: {
    PONG: {
      actions: [
        send({ type: 'PING' }, { to: 'pong', delay: 1000 }),
        () => console.log('PONG'),
      ],
    },
  },
})
