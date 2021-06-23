import { createApp } from 'vue'
import App from './App.vue'
import { inspect } from '@xstate/inspect'
import { router } from './router'

// inspect({
//   iframe: false,
// })

createApp(App).use(router).mount('#app')
