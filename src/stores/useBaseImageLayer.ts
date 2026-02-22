import type Konva from 'konva'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBaseImageLayer = defineStore('baseImageLayer', () => {
  const stageConfig = ref({} as Konva.StageConfig)
  const imageLayerConfig = ref({
    id: `image-${crypto.randomUUID()}`,
  } as Konva.LayerConfig)
  const imageConfig = ref({} as Konva.ImageConfig)

  const isValid = () => {
    if (stageConfig.value.width && stageConfig.value.height) {
      return true
    }
  }

  const getCenter = () => {
    if (!isValid()) {
      throw new Error('Stage configuration is not set. Please initialize the base layer first.')
    }

    return {
      x: stageConfig.value.width! / 2,
      y: stageConfig.value.height! / 2,
    }
  }

  const init = (image: HTMLImageElement) => {
    stageConfig.value = {
      width: image.width,
      height: image.height,
    } as Konva.StageConfig

    imageConfig.value = {
      id: `image-${crypto.randomUUID()}`,
      image,
      x: 0,
      y: 0,
      listening: false,
    } as Konva.ImageConfig
  }

  return {
    stageConfig,
    imageLayerConfig,
    imageConfig,
    init,
    isValid,
    getCenter,
  }
})
