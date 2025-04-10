type VertexId = {
  id: string;
};
export type VertexWithId<Vertex> = [Vertex] extends [never]
  ? VertexId
  : VertexId & {
      vertex: Vertex;
    };
export type EdgeId = {
  from: string;
  to: string;
};
export type EdgeWithId<Edge> = [Edge] extends [never]
  ? EdgeId
  : EdgeId & {
      edge: Edge;
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
}

export interface ITraversal<Vertex> {
  traverseIds(): Generator<string>;
  traverse(): Generator<VertexWithId<Vertex>>;
}

export interface ICycles {
  findCycles(depthLimit?: number): Generator<string[]>;
  hasCycles(depthLimit?: number): boolean;
}
