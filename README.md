# XState Choreography

An ongoing experiment in creating a centralized actor registry and event bus for XState.

To run, just clone the repo and then `yarn install && yarn dev`. In order to trigger the example events, you can either toggle your browser's network connection between online and offline mode, or simply just open your DevTools and click back and forth between your DevTools pane and the browser window.

NOTE: The service worker implementation requires use of Chrome during development [see Vite's docs on web workers](https://vitejs.dev/guide/features.html#web-workers) for details.
