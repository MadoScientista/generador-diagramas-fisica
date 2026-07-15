export type AxisType = 'x' | 'y';
export type CharacterType = 'square' | 'person' | 'bike' | 'car';
export type Orientation = 'left' | 'right' | 'none' | 'up' | 'down';
export type SemanticRole =
  | 'initial'
  | 'final'
  | 'origin'
  | 'velocity'
  | 'acceleration'
  | 'force'
  | 'electric-field'
  | 'label-xi'
  | 'label-xf'
  | 'label-v'
  | 'label-a'
  | 'label-dx'
  | 'label-t'
  | 'custom';
export type VectorType = 'velocity' | 'acceleration' | 'force' | 'electric-field';
export type Layer = 'background' | 'axis' | 'positions' | 'character' | 'vectors' | 'displacement' | 'labels';

export interface NodeBase {
  id: string;
  visible: boolean;
}

export interface SceneNode extends NodeBase {
  type: 'scene';
  children: SceneGraphNode[];
}

export interface AxisNode extends NodeBase {
  type: 'axis';
  axisType: AxisType;
  orientation: Orientation;
  showTicks: boolean;
  showArrow: boolean;
}

export interface OriginNode extends NodeBase {
  type: 'origin';
  label: string;
}

export interface PositionNode extends NodeBase {
  type: 'position';
  semanticRole: SemanticRole;
  physicalValue: number;
  showMarker: boolean;
  showLabel: boolean;
}

export interface CharacterNode extends NodeBase {
  type: 'character';
  orientation: Orientation;
  characterType?: CharacterType;
}

export interface VectorNode extends NodeBase {
  type: 'vector';
  vectorType: VectorType;
  orientation: Orientation;
  magnitude: number;
}

export interface LabelNode extends NodeBase {
  type: 'label';
  text: string;
  semanticRole: SemanticRole;
}

export interface DisplacementArrowNode extends NodeBase {
  type: 'displacement-arrow';
  orientation: Orientation;
  physicalXi: number;
  physicalXf: number;
}

export interface GroupNode extends NodeBase {
  type: 'group';
  children: SceneGraphNode[];
}

export type SceneGraphNode =
  | SceneNode
  | AxisNode
  | OriginNode
  | PositionNode
  | CharacterNode
  | VectorNode
  | LabelNode
  | DisplacementArrowNode
  | GroupNode;

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedNode {
  id: string;
  node: SceneGraphNode;
  position: Point;
  boundingBox: BoundingBox;
  layer: Layer;
  rotation: number;
  visible: boolean;
}

export interface LayoutScene {
  nodes: PositionedNode[];
  viewportWidth: number;
  viewportHeight: number;
}

export type SceneGraph = SceneNode;

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };

export interface PhysicsInput {
  moduleId: string;
  [key: string]: unknown;
}

export interface PhysicsResult {
  [key: string]: unknown;
}

export interface DiagramModel {
  moduleId: string;
  [key: string]: unknown;
}

export interface ModuleInfo {
  id: string;
  name: string;
  description: string;
}

export interface PhysicsModule {
  info: ModuleInfo;
  validate(input: Record<string, string>): ValidationResult;
  solve(input: Record<string, number>): PhysicsResult;
  infer(result: PhysicsResult): DiagramModel;
  buildScene(model: DiagramModel): SceneGraph;
}

export interface RendererError {
  type: 'renderer';
  message: string;
}

export interface LayoutError {
  type: 'layout';
  message: string;
}

export interface PipelineError {
  type: 'validation' | 'physics' | 'inference' | 'scene' | 'layout' | 'render';
  message: string;
  detail?: string;
}

export interface PipelineSuccess {
  type: 'success';
  svg: string;
  layoutScene: LayoutScene;
}

export type PipelineResult = PipelineSuccess | PipelineError;
