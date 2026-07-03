import type Konva from 'konva'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useBaseImageLayer = defineStore('baseImageLayer', () => {
  const _stageSize = ref({ width: 0, height: 0 })
  const scale = ref(1)

  const stageConfig = computed(
    () =>
      ({
        width: _stageSize.value.width * scale.value,
        height: _stageSize.value.height * scale.value,
        scaleX: scale.value,
        scaleY: scale.value,
      }) as Konva.StageConfig,
  )

  const imageLayerConfig = ref({
    id: `image-${crypto.randomUUID()}`,
  } as Konva.LayerConfig)

  const imageConfigs = ref([] as Konva.ImageConfig[])

  const isValid = computed(() => imageConfigs.value.length > 0)

  const getCenter = () => {
    if (!isValid.value) {
      throw new Error('Stage configuration is not set. Please initialize the base layer first.')
    }
    return {
      x: _stageSize.value.width / 2,
      y: _stageSize.value.height / 2,
    }
  }

  const add = (image: HTMLImageElement) => {
    const isFirstImage = imageConfigs.value.length < 1
    if (isFirstImage) {
      _stageSize.value = { width: image.width, height: image.height }
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

  const clear = () => {
    imageConfigs.value = []
    _stageSize.value = { width: 0, height: 0 }
    scale.value = 1
  }

  return {
    stageConfig,
    imageLayerConfig,
    imageConfigs,
    isValid,
    scale,
    add,
    updateAll,
    getCenter,
    clear,
  }
})
