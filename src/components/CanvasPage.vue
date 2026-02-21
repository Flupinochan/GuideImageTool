<template>
  <div style="display: flex; gap: 8px; margin-bottom: 12px">
    <v-btn v-for="text in numberText" :key="text" class="text-h6" @click="addText(text)">
      {{ text }}
    </v-btn>
    <v-btn @click="addBorder">枠を追加</v-btn>
    <v-btn @click="copyCanvasToClipboard"> 画像をコピー </v-btn>
    <v-btn @click="exportImage">保存</v-btn>
    <div
      v-if="showMenu"
      :style="{
        position: 'fixed',
        top: menuPosition.y + 'px',
        left: menuPosition.x + 'px',
        width: '80px',
        background: 'white',
        border: '1px solid #ccc',
        zIndex: 1000,
      }"
      @click.stop
    >
      <button
        :style="{
          width: '100%',
          backgroundColor: 'white',
          color: 'black',
          border: 'none',
          margin: 0,
          padding: '10px',
          cursor: 'pointer',
        }"
        @click="deleteSelected"
      >
        Delete
      </button>
    </div>
  </div>

  <div ref="containerRef"></div>
</template>

<script setup lang="ts">
import Konva from 'konva'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const containerRef = ref<HTMLDivElement | null>(null)
const numberText = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']

let stage: Konva.Stage
// 背景画像用レイヤー
let backgroundLayer: Konva.Layer
// ①, ②...テキスト用レイヤー
let contentLayer: Konva.Layer
// 赤枠用レイヤー
let borderLayer: Konva.Layer
let transformer: Konva.Transformer

const showMenu = ref(false)
const selectedId = ref<string>('')
const menuPosition = ref({ x: 0, y: 0 })

onMounted(() => {
  if (!containerRef.value) return

  stage = new Konva.Stage({ container: containerRef.value })

  backgroundLayer = new Konva.Layer()
  contentLayer = new Konva.Layer()
  borderLayer = new Konva.Layer()

  stage.add(backgroundLayer)
  stage.add(contentLayer)
  stage.add(borderLayer)

  // Ctrl + Vの画像貼り付けイベントリスナー
  window.addEventListener('paste', handlePaste)
  // 赤枠選択解除
  stage.on('click', (event) => {
    if (event.target !== stage) return
    transformer.nodes([])
    borderLayer.batchDraw()
  })
  window.addEventListener('click', handleWindowClick)
  stage.on('contextmenu', (event) => {
    event.evt.preventDefault()

    if (event.target === stage) {
      showMenu.value = false
      transformer.nodes([])
      borderLayer.batchDraw()
      return
    }

    menuPosition.value = {
      x: event.evt.clientX,
      y: event.evt.clientY,
    }

    selectedId.value = event.target.id()
    showMenu.value = true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', handlePaste)
  stage.destroy()
  window.removeEventListener('click', handleWindowClick)
})

// 画像貼り付け
function handlePaste(event: ClipboardEvent) {
  const pastedFiles = event.clipboardData.files
  if (!pastedFiles || pastedFiles.length === 0) return

  const file = pastedFiles[0]
  if (!file.type.startsWith('image/')) return

  const blobUrl = URL.createObjectURL(file)
  const img = new Image()

  img.onload = () => {
    // Canvasをクリア
    backgroundLayer.destroyChildren()
    contentLayer.destroyChildren()

    // Canvasサイズを画像サイズに合わせる
    stage.width(img.width)
    stage.height(img.height)

    // 画像用Canvasを初期化
    const konvaImage = new Konva.Image({
      image: img,
      x: 0,
      y: 0,
      listening: false,
    })

    backgroundLayer.add(konvaImage)
    backgroundLayer.batchDraw()

    URL.revokeObjectURL(blobUrl)
  }

  img.src = blobUrl
}

// Canvasへのテキスト追加
function addText(text: string) {
  // 背景画像がある場合のみ追加可能
  const backgroundImage = backgroundLayer.findOne('Image')
  if (!backgroundImage) return

  // Canvas中央座標を計算
  const centerX = stage.width() / 2
  const centerY = stage.height() / 2

  // テキストの定義
  const konvaText = new Konva.Text({
    id: crypto.randomUUID(),
    text,
    x: centerX,
    y: centerY,
    fill: 'red',
    fontSize: 40,
    draggable: true,
  })

  // テキスト幅・高さから正確な中央に移動
  konvaText.offsetX(konvaText.width() / 2)
  konvaText.offsetY(konvaText.height() / 2)

  contentLayer.add(konvaText)
  contentLayer.batchDraw()
}

// Canvasへの赤枠追加
function addBorder() {
  // 背景画像がある場合のみ追加可能
  const backgroundImage = backgroundLayer.findOne('Image')
  if (!backgroundImage) return

  // Canvas中央座標を計算
  const centerX = stage.width() / 2
  const centerY = stage.height() / 2

  // 赤枠定義
  const rect = new Konva.Rect({
    id: crypto.randomUUID(),
    x: centerX,
    y: centerY,
    width: 200,
    height: 100,
    stroke: 'red',
    strokeWidth: 2,
    draggable: true,
    strokeScaleEnabled: false,
  })

  // テキスト幅・高さから正確な中央に移動
  rect.offsetX(rect.width() / 2)
  rect.offsetY(rect.height() / 2)

  // 赤枠クリックでリサイズ用Anchror表示
  rect.on('click', () => {
    transformer.nodes([rect])
    borderLayer.batchDraw()
  })

  borderLayer.add(rect)
  borderLayer.batchDraw()

  // 赤枠のリサイズ
  transformer = new Konva.Transformer({
    nodes: [rect],
    anchorSize: 8,
    rotateEnabled: false,
    borderEnabled: false,
  })
  borderLayer.add(transformer)
}

// Canvasをクリップボードにコピー
async function copyCanvasToClipboard() {
  transformer.nodes([])
  borderLayer.batchDraw()

  const canvas = stage.toCanvas()
  const blob: Blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ])
}

// Canvasを画像として保存
function exportImage() {
  const dataURL = stage.toDataURL()
  const link = document.createElement('a')
  link.download = 'guide-image-tool.png'
  link.href = dataURL
  link.click()
}

// Hide menu on window click
const handleWindowClick = () => {
  showMenu.value = false
}

function deleteSelected() {
  if (!selectedId.value) return

  const node = stage.findOne(`#${selectedId.value}`)
  if (!node) return

  transformer.nodes([])
  node.destroy()

  borderLayer.batchDraw()
  contentLayer.batchDraw()

  showMenu.value = false
}
</script>

<style scoped></style>
