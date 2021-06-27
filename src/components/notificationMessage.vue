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
    :class="[
      state.context.message.type === 'success'
        ? 'bg-positive-800 border-positive-700'
        : 'bg-negative-800 border-negative-700',
    ]"
  >
    <div class="relative z-10 text-gray-50 text-sm text-center w-full">
      {{ state.context.message.msg }}
      {{ state.context.message.createdAt }}
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
      :class="[
        state.context.message.type === 'success'
          ? 'bg-positive-900'
          : 'bg-negative-900',
      ]"
      :style="`--tw-translate-x: ${state.context.timerWidth}%;`"
    ></div>
  </div>
</template>

<script>
import { useActor } from '@xstate/vue'
export default {
  props: {
    messageActor: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { state, send } = useActor(props.messageActor)

    return {
      state,
      send,
    }
  },
}
</script>
