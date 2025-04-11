type VertexId = {
  id: string;
};
export type VertexWithId<Vertex> = [Vertex] extends [never]
  ? VertexId & {
      vertex?: never;
    }
  : VertexId & {
      vertex: Vertex;
    };
export type EdgeId = {
  from: string;
  to: string;
};
export type EdgeWithId<Edge> = [Edge] extends [never]
  ? EdgeId & {
      edge?: never;
    }
  : EdgeId & {
      edge: Edge;
    };

export type DiGraphDict<Vertex = never, Edge = never> = {
  vertices: Record<string, Vertex>;
  edges: Record<string, Record<string, Edge>>;
};

export interface IDiGraph<Vertex, Edge> {
  // Vertex operations
  hasVertex(id: string): boolean;
  getVertex(id: string): Vertex | undefined;
  addVertices(...vertices: VertexWithId<Vertex>[]): void;
  deleteVertices(...ids: string[]): void;
  updateVertex(vertex: VertexWithId<Vertex>): void;
  getVertexIds(): Generator<string>;

  // Edge operations
  hasEdge(edgeId: EdgeId): boolean;
  getEdge(edgeId: EdgeId): Edge | undefined;
  addEdges(...edges: EdgeWithId<Edge>[]): void;
  deleteEdges(...edgeIds: EdgeId[]): void;
  updateEdge(edge: EdgeWithId<Edge>): void;
  getEdgeIds(): Generator<EdgeId>;

  // Descendants
  getDescendantIds(id: string): Generator<string>;
  getDescendants(id: string): Generator<VertexWithId<Vertex>>;
  // Ancestors
  getAncestorIds(id: string): Generator<string>;
  getAncestors(id: string): Generator<VertexWithId<Vertex>>;

  // Serialization
  toDict(): DiGraphDict<Vertex, Edge>;
}

export type TraverseOptions = {
  startVertexId?: string;
  depthLimit?: number;
  visited?: Set<string>;
};
export interface ITraversal<Vertex> {
  traverseIds(options?: TraverseOptions): Generator<string>;
  traverse(options?: TraverseOptions): Generator<VertexWithId<Vertex>>;
}

export interface ICycles<Vertex, Edge> {
  readonly graph: IDiGraph<Vertex, Edge>;
  findCycles(depthLimit?: number): Generator<string[]>;
  hasCycles(depthLimit?: number): boolean;
}
