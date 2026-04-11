import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppSettings = defineStore(
  'appSettings',
  () => {
    const numText = ref({
      sharedTextConfig: {
        fontSize: 40,
        fill: '#ff0000',
      },
    })

    const squareFrame = ref({
      sharedSquareFrameConfig: {
        stroke: '#ff0000',
        strokeWidth: 2,
      },
    })

    const outerBorder = ref({
      enabled: false,
      thickness: 1,
      color: '#444444',
    })

    return {
      numText,
      squareFrame,
      outerBorder,
    }
  },
  {
    persist: true,
  },
)
