<template>
  <div
    class="
      relative
      w-64
      px-4
      py-2
      mb-2
      overflow-hidden
      transform
      rounded
      shadow-lg
      border border-solid
    "
    :class="messageClasses.container"
  >
    <div class="relative z-10 text-gray-50 text-sm text-center w-full">
      {{ state.context.message.msg }}<br />
      {{ created }}
    </div>
    <div
      @click="send('DISMISS')"
      class="absolute z-20 top-0 right-0 transform w-4 h-4 cursor-pointer"
    >
      &times;
    </div>
    <div
      class="
        absolute
        z-0
        inset-0
        transform
        -translate-x-0
        transition-transform
        opacity-75
      "
      :class="messageClasses.timer"
      :style="`--tw-translate-x: ${state.context.timerWidth}%;`"
    ></div>
  </div>
</template>

<script>
import { useActor } from '@xstate/vue'
import { reactive } from '@vue/reactivity'

export default {
  props: {
    messageActor: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { state, send } = useActor(props.messageActor)
    const { type, createdAt } = state.value.context.message
    let messageClasses

    const d = new Date(createdAt)
    const hrs = d.getHours()
    const hours = hrs % 12 === 0 ? 12 : hrs
    const min = d.getMinutes()
    const minutes = min < 10 ? `0${min}` : min
    const sec = d.getSeconds()
    const seconds = sec < 10 ? `0${sec}` : sec
    const ampm = d.getHours() > 12 ? 'PM' : 'AM'
    const created = `${hours}:${minutes}:${seconds} ${ampm}`

    if (type === 'success') {
      messageClasses = reactive({
        container: 'bg-positive-800 border-positive-700',
        timer: 'bg-positive-900',
      })
    } else if (type === 'warning') {
      messageClasses = reactive({
        container: 'bg-warning-800 border-warning-700',
        timer: 'bg-warning-900',
      })
    } else {
      messageClasses = reactive({
        container: 'bg-negative-800 border-negative-700',
        timer: 'bg-negative-900',
      })
    }

    return {
      state,
      send,
      messageClasses,
      created,
    }
  },
}
</script>
