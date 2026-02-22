<template>
  <v-btn v-for="text in numberText" :key="text" class="text-h6" @click="handleAddText(text)">
    {{ text }}
  </v-btn>
  <v-btn @click="handleAddSquareFrame">枠</v-btn>
  <v-btn @click="copyCanvasToClipboard"> コピー</v-btn>
  <v-btn @click="exportCanvas">保存</v-btn>
  <v-btn
    v-if="showMenu"
    @click="handleDelete"
    variant="elevated"
    :style="{
      position: 'fixed',
      top: `${menuPosition.y}px`,
      left: `${menuPosition.x}px`,
      zIndex: 1000,
    }"
  >
    Delete
  </v-btn>
  <v-stage
    ref="stageRef"
    :config="baseImageLayer.stageConfig"
    @click="handleStageClick"
    @contextmenu="handleContextMenu"
  >
    <v-layer :config="baseImageLayer.imageLayerConfig">
      <v-image :config="baseImageLayer.imageConfig" />
    </v-layer>
    <v-layer :config="numTextLayer.layerConfig">
      <v-text
        v-for="textConfig in numTextLayer.textConfigs"
        :key="textConfig.id"
        :config="textConfig"
      />
    </v-layer>
    <v-layer>
      <v-rect
        v-for="squareFrameConfig in squareFramelayer.squareFrameConfig"
        :key="squareFrameConfig.id"
        :config="squareFrameConfig"
        @click="handleSquareFrameClick(squareFrameConfig.id)"
      />
      <v-transformer
        ref="squareFrameTransformerRef"
        :config="{
          anchorSize: 8,
          rotateEnabled: false,
          borderEnabled: false,
          keepRatio: false,
        }"
      />
    </v-layer>
  </v-stage>
</template>

<script setup lang="ts">
import { useBaseImageLayer } from '@/stores/useBaseImageLayer'
import { useNumTextLayer } from '@/stores/useNumTextLayer'
import { useSquareFrameLayer } from '@/stores/useSquareFrameLayer'
import type Konva from 'konva'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

type StageRefLike = {
  getNode: () => Konva.Stage
}
type TransformerRefLike = {
  getNode: () => Konva.Transformer
}

const stageRef = ref<StageRefLike>()
const squareFrameTransformerRef = ref<TransformerRefLike>()

const showMenu = ref(false)
const selectedId = ref<string>('')
const menuPosition = ref({ x: 0, y: 0 })

const baseImageLayer = useBaseImageLayer()
const numTextLayer = useNumTextLayer()
const squareFramelayer = useSquareFrameLayer()

const numberText = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']

function handleStageClick(event: Konva.KonvaEventObject<PointerEvent>) {
  if (!stageRef.value || !squareFrameTransformerRef.value) return
  if (event.target === stageRef.value.getNode()) {
    squareFrameTransformerRef.value.getNode().nodes([])
    return
  }
  handleContextMenu(event)
}

function handlePaste(event: ClipboardEvent) {
  const pastedFiles = event.clipboardData?.files
  if (!pastedFiles || pastedFiles.length === 0) return

  const file = pastedFiles[0]
  if (!file?.type.startsWith('image/')) return

  const blobUrl = URL.createObjectURL(file)

  const img = new Image()
  img.onload = () => {
    baseImageLayer.init(img)
    URL.revokeObjectURL(blobUrl)
  }
  img.src = blobUrl
}

function handleAddText(text: string) {
  if (!squareFrameTransformerRef.value) return
  squareFrameTransformerRef.value.getNode().nodes([])
  numTextLayer.add(text)
}

async function handleAddSquareFrame() {
  if (!squareFrameTransformerRef.value) return
  squareFrameTransformerRef.value.getNode().nodes([])
  squareFramelayer.add()
  await nextTick()
  handleSquareFrameClick(squareFramelayer.squareFrameConfig.at(-1)?.id)
}

function handleSquareFrameClick(frameId: string | undefined) {
  if (!frameId || !stageRef.value || !squareFrameTransformerRef.value) return
  const node = stageRef.value.getNode().findOne(`#${frameId}`)
  if (!node) return
  squareFrameTransformerRef.value.getNode().nodes([node])
}

async function copyCanvasToClipboard() {
  if (!stageRef.value || !squareFrameTransformerRef.value) return
  squareFrameTransformerRef.value.getNode().nodes([])
  const canvas = stageRef.value.getNode().toCanvas()
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('Failed to create blob'))),
      'image/png',
    ),
  )
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ])
}

function exportCanvas() {
  if (!stageRef.value) return
  const dataURL = stageRef.value.getNode().toDataURL()
  const link = document.createElement('a')
  link.download = `guide-image-tool_${Date.now()}.png`
  link.href = dataURL
  link.click()
}

function handleContextMenu(event: Konva.KonvaEventObject<PointerEvent>) {
  if (!stageRef.value) return
  if (event.target === stageRef.value.getNode()) {
    showMenu.value = false
    return
  }
  event.evt.preventDefault()
  selectedId.value = event.target.id()
  menuPosition.value = { x: event.evt.clientX, y: event.evt.clientY }
  showMenu.value = true
}

const handleWindowClick = () => {
  showMenu.value = false
}

function handleDelete() {
  if (!selectedId.value || !stageRef.value || !squareFrameTransformerRef.value) return

  const node = stageRef.value.getNode().findOne(`#${selectedId.value}`)
  if (!node) return

  squareFrameTransformerRef.value.getNode().nodes([])
  node.destroy()

  showMenu.value = false
}

onMounted(() => {
  window.addEventListener('paste', handlePaste)
  window.addEventListener('click', handleWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
  window.removeEventListener('click', handleWindowClick)
})
</script>

<style scoped></style>
