import { useBaseImageLayer } from '@/stores/useBaseImageLayer'
import { useAppSettings } from '@/stores/useAppSettings'
import type { StageRefLike, TransformerRefLike } from '@/types/canvasRefs'
import type { Ref } from 'vue'

export function useCanvasExport(
  stageRef: Ref<StageRefLike | undefined>,
  squareFrameTransformerRef: Ref<TransformerRefLike | undefined>,
) {
  const baseImageLayer = useBaseImageLayer()
  const appSettings = useAppSettings()

  async function createExportBlob() {
    if (!stageRef.value || !squareFrameTransformerRef.value) return null
    const stage = stageRef.value.getNode()
    if (stage.width() === 0 || stage.height() === 0) return null
    squareFrameTransformerRef.value.getNode().nodes([])
    return await new Promise<Blob>((resolve, reject) =>
      stage
        .toCanvas({ pixelRatio: 1 / baseImageLayer.scale })
        .toBlob(
          (value) => (value ? resolve(value) : reject(new Error('Failed to create blob'))),
          'image/png',
        ),
    )
  }

  async function addBorderToBlob(
    srcBlob: Blob | null,
    borderThickness: number,
    borderColor: string,
  ): Promise<Blob | null> {
    if (!srcBlob) return null

    return await new Promise<Blob | null>((resolve, reject) => {
      const url = URL.createObjectURL(srcBlob)
      const img = new Image()

      img.onload = () => {
        try {
          const srcW = img.naturalWidth
          const srcH = img.naturalHeight
          const margin = borderThickness
          const outW = srcW + margin * 2
          const outH = srcH + margin * 2

          const canvas = document.createElement('canvas')
          canvas.width = outW
          canvas.height = outH
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('2D context unavailable')

          // 元画像を余白内側に描画
          ctx.drawImage(img, margin, margin, srcW, srcH)

          // 余白領域に枠を描画
          ctx.fillStyle = borderColor
          ctx.fillRect(0, 0, outW, borderThickness) // top
          ctx.fillRect(0, outH - borderThickness, outW, borderThickness) // bottom
          ctx.fillRect(0, 0, borderThickness, outH) // left
          ctx.fillRect(outW - borderThickness, 0, borderThickness, outH) // right

          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
        } catch (err) {
          const e = err instanceof Error ? err : new Error(String(err))
          reject(e)
        } finally {
          URL.revokeObjectURL(url)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image from blob'))
      }

      img.src = url
    })
  }

  async function copyCanvasToClipboard() {
    const blob = await createExportBlob()
    if (!blob) return
    const withOuterBorderBlob = appSettings.outerBorder.enabled
      ? await addBorderToBlob(
          blob,
          appSettings.outerBorder.thickness,
          appSettings.outerBorder.color,
        )
      : blob
    if (!withOuterBorderBlob) return

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': withOuterBorderBlob,
      }),
    ])
  }

  async function exportCanvas() {
    const blob = await createExportBlob()
    if (!blob) return

    const withOuterBorderBlob = appSettings.outerBorder.enabled
      ? await addBorderToBlob(
          blob,
          appSettings.outerBorder.thickness,
          appSettings.outerBorder.color,
        )
      : blob
    if (!withOuterBorderBlob) return

    const dataURL = URL.createObjectURL(withOuterBorderBlob)
    const link = document.createElement('a')
    link.download = `guide-image-tool_${Date.now()}.png`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    copyCanvasToClipboard,
    exportCanvas,
  }
}
