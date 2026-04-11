import type Konva from 'konva'

export type StageRefLike = { getNode: () => Konva.Stage }
export type LayerRefLike = { getNode: () => Konva.Layer }
export type TransformerRefLike = { getNode: () => Konva.Transformer }
