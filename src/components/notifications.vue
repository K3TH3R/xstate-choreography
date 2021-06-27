<template>
  <div class="fixed left-0 right-0 bottom-2 flex justify-center">
    <div class="flex flex-col w-64" v-if="messages">
      <transition-group name="fade">
        <NotificationMessage
          v-for="msg in messages"
          :key="msg.state.context.message.createdAt"
          :message-actor="msg"
        />
      </transition-group>
    </div>
  </div>
</template>

<script>
import { notificationsMachineId } from '../machines/notifications.machine'
import { getActor } from '../machines/choreographer.machine'
import { useActor } from '@xstate/vue'
import { computed } from '@vue/runtime-core'
import NotificationMessage from './notificationMessage.vue'

export default {
  components: {
    NotificationMessage,
  },
  setup() {
    const { state } = useActor(getActor(notificationsMachineId))
    const messages = computed(() => state.value.context.showing)

    return {
      state,
      messages,
    }
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
