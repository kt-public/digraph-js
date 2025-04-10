import { IDiGraph, ITraversal, VertexWithId } from './interface';

export abstract class BaseGraphTraversal<Vertex, Edge> implements ITraversal<Vertex> {
  constructor(protected graph: IDiGraph<Vertex, Edge>) {}
  traverseIds(): Generator<string> {
    throw new Error('Method not implemented.');
  }
  *traverse(): Generator<VertexWithId<Vertex>> {
    for (const id of this.traverseIds()) {
      yield { id, vertex: this.graph.getVertex(id)! };
    }
  }
}

export class GraphTraversal<Vertex, Edge> extends BaseGraphTraversal<Vertex, Edge> {
  static create<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId?: string,
    depthLimit?: number,
    strategy?: 'DFS' | 'BFS'
  ): ITraversal<Vertex> {
    return new GraphTraversal<Vertex, Edge>(graph, startVertexId, depthLimit, strategy);
  }

  static bfs<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId?: string,
    depthLimit?: number
  ): ITraversal<Vertex> {
    return this.create(graph, startVertexId, depthLimit, 'BFS');
  }

  static dfs<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId?: string,
    depthLimit?: number
  ): ITraversal<Vertex> {
    return this.create(graph, startVertexId, depthLimit, 'DFS');
  }

  constructor(
    protected graph: IDiGraph<Vertex, Edge>,
    protected startVertexId?: string,
    protected depthLimit: number = Number.POSITIVE_INFINITY,
    protected strategy: 'DFS' | 'BFS' = 'DFS'
  ) {
    super(graph);
  }

  *traverseIds(): Generator<string> {
    const queue: { vertex: string; depth: number }[] = [];
    const isDFS = this.strategy === 'DFS';

    if (!this.startVertexId) {
      const vertices = this.graph.getVertexIds();
      for (const vertex of vertices) {
        queue.push({ vertex, depth: 0 });
      }
    } else {
      queue.push({ vertex: this.startVertexId, depth: 0 });
    }

    const visited = new Set<string>();

    while (queue.length > 0) {
      const { vertex, depth } = isDFS ? queue.pop()! : queue.shift()!;

      if (visited.has(vertex)) {
        continue;
      }

      visited.add(vertex);
      yield vertex;

      if (depth < this.depthLimit) {
        const descendants = this.graph.getDescendantIds(vertex);
        for (const neighbor of descendants) {
          if (!visited.has(neighbor)) {
            queue.push({ vertex: neighbor, depth: depth + 1 });
          }
        }
      }
    }
  }
}

export class DescendantTraversal<Vertex, Edge> extends GraphTraversal<Vertex, Edge> {
  static create<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit: number = Number.POSITIVE_INFINITY
  ): ITraversal<Vertex> {
    return new DescendantTraversal<Vertex, Edge>(graph, startVertexId, depthLimit);
  }

  static *getDescendantIds<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit: number = Number.POSITIVE_INFINITY
  ): Generator<string> {
    yield* this.create(graph, startVertexId, depthLimit).traverseIds();
  }

  static *getDescendants<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit: number = Number.POSITIVE_INFINITY
  ): Generator<{ id: string; vertex: Vertex }> {
    for (const id of this.getDescendantIds(graph, startVertexId, depthLimit)) {
      yield { id, vertex: graph.getVertex(id)! };
    }
  }
}

export class AncestorTraversal<Vertex, Edge> extends BaseGraphTraversal<Vertex, Edge> {
  static create<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit: number = Number.POSITIVE_INFINITY
  ): ITraversal<Vertex> {
    return new AncestorTraversal<Vertex, Edge>(graph, startVertexId, depthLimit);
  }

  static *getAncestorIds<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit: number = Number.POSITIVE_INFINITY
  ): Generator<string> {
    yield* this.create(graph, startVertexId, depthLimit).traverseIds();
  }

  static *getAncestors<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit: number = Number.POSITIVE_INFINITY
  ): Generator<{ id: string; vertex: Vertex }> {
    for (const id of this.getAncestorIds(graph, startVertexId, depthLimit)) {
      yield { id, vertex: graph.getVertex(id)! };
    }
  }

  constructor(
    protected graph: IDiGraph<Vertex, Edge>,
    protected startVertexId: string,
    protected depthLimit: number = Number.POSITIVE_INFINITY
  ) {
    super(graph);
  }

  *traverseIds(): Generator<string> {
    const queue: { vertex: string; depth: number }[] = [];
    queue.push({ vertex: this.startVertexId, depth: 0 });

    const visited = new Set<string>();

    while (queue.length > 0) {
      const { vertex, depth } = queue.shift()!;

      if (visited.has(vertex)) {
        continue;
      }

      visited.add(vertex);
      yield vertex;

      if (depth < this.depthLimit) {
        const ancestors = this.graph.getAncestorIds(vertex);
        for (const ancestor of ancestors) {
          if (!visited.has(ancestor)) {
            queue.push({ vertex: ancestor, depth: depth + 1 });
          }
        }
      }
    }
  }
}
