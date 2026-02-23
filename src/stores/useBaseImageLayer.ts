import type Konva from 'konva'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBaseImageLayer = defineStore('baseImageLayer', () => {
  // v-bindしていないためリアクティブではない状態 (必要になったらv-bindする)
  const stageConfig = ref({} as Konva.StageConfig)
  const imageLayerConfig = ref({
    id: `image-${crypto.randomUUID()}`,
  } as Konva.LayerConfig)
  const imageConfigs = ref([] as Konva.ImageConfig[])

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

  const add = (image: HTMLImageElement) => {
    const isFirstImage = imageConfigs.value.length < 1
    if (isFirstImage) {
      stageConfig.value = {
        width: image.width,
        height: image.height,
      } as Konva.StageConfig
    }

    const newImageConfig: Konva.ImageConfig = {
      id: `image-${crypto.randomUUID()}`,
      name: 'object',
      image,
      x: 0,
      y: 0,
      listening: !isFirstImage,
      draggable: !isFirstImage,
    } as Konva.ImageConfig

    imageConfigs.value.push(newImageConfig)
  }

  const updateAll = (patch: Partial<Konva.ImageConfig>) => {
    for (const cfg of imageConfigs.value) {
      Object.assign(cfg, patch)
    }
  }

  return {
    stageConfig,
    imageLayerConfig,
    imageConfigs,
    add,
    updateAll,
    isValid,
    getCenter,
  }
})
