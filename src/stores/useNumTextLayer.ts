import type Konva from 'konva'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppSettings } from './useAppSettings'
import { useBaseImageLayer } from './useBaseImageLayer'

interface TextConfig extends Konva.TextConfig {
  id: string
  name: string
  text: string
  x: number
  y: number
  draggable: boolean
}

interface SharedTextConfig extends Partial<Konva.TextConfig> {
  fontSize?: number
  fill?: string
}

export const useNumTextLayer = defineStore('numTextLayer', () => {
  const baseImageLayer = useBaseImageLayer()
  const appSettings = useAppSettings()

  const layerConfig = ref({
    id: `num-text-${crypto.randomUUID()}`,
  } as Konva.LayerConfig)
  const textConfigs = ref([] as TextConfig[])
  const sharedTextConfig = appSettings.numText.sharedTextConfig as SharedTextConfig

  const add = (text: string) => {
    if (!baseImageLayer.isValid) return

    const baseCenter = baseImageLayer.getCenter()

    const newTextConfig: TextConfig = {
      id: `num-text-${crypto.randomUUID()}`,
      name: 'object',
      text,
      x: baseCenter.x,
      y: baseCenter.y,
      draggable: true,
    }

    textConfigs.value.push(newTextConfig)
  }

  const getEffective = (config: TextConfig): Konva.TextConfig => {
    return {
      ...sharedTextConfig,
      id: config.id,
      name: config.name,
      text: config.text,
      x: config.x,
      y: config.y,
      draggable: config.draggable,
    } as Konva.TextConfig
  }

  const clear = () => {
    textConfigs.value = []
  }

  return {
    layerConfig,
    textConfigs,
    sharedTextConfig,
    add,
    getEffective,
    clear,
  }
})
