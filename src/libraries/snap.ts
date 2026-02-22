import Konva from 'konva'

// https://konvajs.org/docs/sandbox/Objects_Snapping.html

const GUIDELINE_OFFSET = 1

function getLineGuideStops(stage: Konva.Stage, skipShape?: Konva.Node) {
  const vertical: number[] = [0, stage.width() / 2, stage.width()]
  const horizontal: number[] = [0, stage.height() / 2, stage.height()]

  stage.find('.object').forEach((guideItem) => {
    if (guideItem === skipShape) return
    const box = guideItem.getClientRect()
    vertical.push(box.x, box.x + box.width, box.x + box.width / 2)
    horizontal.push(box.y, box.y + box.height, box.y + box.height / 2)
  })

  return { vertical, horizontal }
}

type SnapPoint = { guide: number; offset: number; snap: 'start' | 'center' | 'end' }

function getObjectSnappingEdges(node: Konva.Node) {
  const box = node.getClientRect()
  const absPos = node.absolutePosition()

  const vertical: SnapPoint[] = [
    { guide: box.x, offset: absPos.x - box.x, snap: 'start' },
    { guide: box.x + box.width / 2, offset: absPos.x - (box.x + box.width / 2), snap: 'center' },
    { guide: box.x + box.width, offset: absPos.x - (box.x + box.width), snap: 'end' },
  ]

  const horizontal: SnapPoint[] = [
    { guide: box.y, offset: absPos.y - box.y, snap: 'start' },
    { guide: box.y + box.height / 2, offset: absPos.y - (box.y + box.height / 2), snap: 'center' },
    { guide: box.y + box.height, offset: absPos.y - (box.y + box.height), snap: 'end' },
  ]

  return { vertical, horizontal }
}

type Guide = {
  lineGuide: number
  offset: number
  orientation: 'V' | 'H'
  snap: 'start' | 'center' | 'end'
}

function getGuides(
  lineGuideStops: ReturnType<typeof getLineGuideStops>,
  itemBounds: ReturnType<typeof getObjectSnappingEdges>,
): Guide[] {
  const resultV: SnapPoint[] = []
  const resultH: SnapPoint[] = []

  lineGuideStops.vertical.forEach((lineGuide) => {
    itemBounds.vertical.forEach((itemBound) => {
      if (Math.abs(lineGuide - itemBound.guide) < GUIDELINE_OFFSET) resultV.push(itemBound)
    })
  })

  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((itemBound) => {
      if (Math.abs(lineGuide - itemBound.guide) < GUIDELINE_OFFSET) resultH.push(itemBound)
    })
  })

  const guides: Guide[] = []

  if (resultV.length) {
    const minV = resultV.reduce((prev, curr) =>
      Math.abs(curr.guide - prev.guide) < Math.abs(prev.guide - curr.guide) ? prev : curr,
    )
    guides.push({ lineGuide: minV.guide, offset: minV.offset, orientation: 'V', snap: minV.snap })
  }

  if (resultH.length) {
    const minH = resultH.reduce((prev, curr) =>
      Math.abs(curr.guide - prev.guide) < Math.abs(prev.guide - curr.guide) ? prev : curr,
    )
    guides.push({ lineGuide: minH.guide, offset: minH.offset, orientation: 'H', snap: minH.snap })
  }

  return guides
}

function drawGuides(layer: Konva.Layer, guides: Guide[]) {
  guides.forEach((lg) => {
    const line = new Konva.Line({
      points: lg.orientation === 'H' ? [-6000, 0, 6000, 0] : [0, -6000, 0, 6000],
      stroke: 'rgb(0,161,255)',
      strokeWidth: 1,
      name: 'guid-line',
      dash: [4, 6],
    })
    layer.add(line)
    line.absolutePosition(
      lg.orientation === 'H' ? { x: 0, y: lg.lineGuide } : { x: lg.lineGuide, y: 0 },
    )
  })
}

export function dragMoveHandler(stage: Konva.Stage, layer: Konva.Layer) {
  return (e: Konva.KonvaEventObject<DragEvent>) => {
    layer.find('.guid-line').forEach((l) => l.destroy())
    const lineGuideStops = getLineGuideStops(stage, e.target)
    const itemBounds = getObjectSnappingEdges(e.target)
    const guides = getGuides(lineGuideStops, itemBounds)
    if (!guides.length) return
    drawGuides(layer, guides)
    const absPos = e.target.absolutePosition()
    guides.forEach((lg) => {
      if (lg.orientation === 'V') absPos.x = lg.lineGuide + lg.offset
      if (lg.orientation === 'H') absPos.y = lg.lineGuide + lg.offset
    })
    e.target.absolutePosition(absPos)
  }
}

export function dragEndHandler(layer: Konva.Layer) {
  return () => {
    layer.find('.guid-line').forEach((l) => l.destroy())
  }
}
