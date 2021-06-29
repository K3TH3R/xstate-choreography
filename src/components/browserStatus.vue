<template>
  <div class="text-xs text-gray-500">{{ appStatus }}</div>
</template>

<script>
import { browserStatusMachineId } from '../machines/browserStatus.machine'
import { getActor } from '../machines/choreographer.machine'
import { useActor } from '@xstate/vue'
import { computed } from '@vue/runtime-core'

export default {
  setup() {
    const { state } = useActor(getActor(browserStatusMachineId))
    const appStatus = computed(() => {
      if (!state.value.context.online) {
        return `The network appears to be down`
      } else if (!state.value.context.visible) {
        return `The browser tab is not visible`
      } else if (!state.value.context.focused) {
        return `The browser tab is not focused`
      }
      return `Active`
    })

    return {
      appStatus,
    }
  },
}
</script>
