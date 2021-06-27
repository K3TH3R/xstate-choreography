<template>
  <div
    class="
      min-h-screen
      flex
      items-center
      justify-center
      py-12
      px-4
      sm:px-6
      lg:px-8
    "
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <p class="mt-2 text-center text-base text-gray-200">
          Sign in to your account
        </p>
      </div>
      <form class="mt-8 space-y-6">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="
                appearance-none
                rounded-none
                relative
                block
                w-full
                px-3
                py-2
                bg-gray-800
                border border-gray-700
                placeholder-gray-400
                text-gray-900
                rounded-t-md
                focus:outline-none
                focus:ring-orange-500
                focus:border-orange-500
                focus:z-10
                sm:text-sm
              "
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="
                appearance-none
                rounded-none
                relative
                block
                w-full
                px-3
                py-2
                bg-gray-800
                border border-gray-700
                placeholder-gray-400
                text-gray-900
                rounded-b-md
                focus:outline-none
                focus:ring-orange-500
                focus:border-orange-500
                focus:z-10
                sm:text-sm
              "
              placeholder="Password"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              class="
                h-4
                w-4
                bg-gray-800
                text-orange-600
                focus:ring-orange-500
                border-gray-700
                rounded
              "
            />
            <label for="remember_me" class="ml-2 block text-sm text-gray-500">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a
              href="#"
              class="font-medium text-orange-600 hover:text-orange-500"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="
              group
              relative
              w-full
              flex
              justify-center
              py-2
              px-4
              border border-gray-700
              text-sm
              font-medium
              rounded-md
              text-gray-50
              bg-orange-600
              transition-colors
              hover:bg-orange-700
              focus:outline-none
              focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
            "
            @click="send('LOGIN')"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- Heroicon name: solid/lock-closed -->
              <svg
                class="h-5 w-5 text-orange-400 group-hover:text-orange-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { inject } from '@vue/runtime-core'
import { appMachineId } from '../machines/App.machine'

export default {
  setup() {
    const { state, send } = inject(appMachineId)

    return {
      state,
      send,
    }
  },
}
</script>
