<template>
  <div class="fixed left-0 right-0 bottom-2 flex justify-center" v-if="message">
    <div class="relative w-64 bg-orange-800 px-4 py-2 overflow-hidden">
      <div class="relative z-10 text-gray-50 text-sm text-center w-full">
        {{ message.context.message.msg }}::{{
          message.context.message.createdAt
        }}
      </div>
      <div
        class="
          absolute
          z-0
          inset-0
          bg-orange-900
          transform
          -translate-x-0
          transition-transform
        "
        :style="`--tw-translate-x: ${timerWidth}%;`"
      ></div>
    </div>
  </div>
</template>

<script>
import { notificationsMachineId } from '../machines/notifications.machine'
import { getActor } from '../machines/choreographer.machine'
import { useActor } from '@xstate/vue'
import { computed } from '@vue/runtime-core'

export default {
  setup() {
    const { state } = useActor(getActor(notificationsMachineId))
    const message = computed(() => {
      if ('showOldestItemInQueue' in state.value.children) {
        const { state: messageState } = useActor(
          state.value.children.showOldestItemInQueue,
        )
        return messageState.value
      }
      return null
    })
    const timerWidth = computed(() => message.value.context.timerWidth)

    return {
      state,
      message,
      timerWidth,
    }
  },
}
</script>

<style>
.visualTimer {
  transition: bo;
}
</style>
