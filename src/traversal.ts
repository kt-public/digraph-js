import { IDiGraph, ITraversal, TraverseOptions, VertexWithId } from './interface.js';

export abstract class BaseGraphTraversal<Vertex, Edge> implements ITraversal<Vertex> {
  constructor(protected graph: IDiGraph<Vertex, Edge>) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  traverseIds(options?: TraverseOptions): Generator<string> {
    throw new Error('Method not implemented.');
  }
  *traverse(options?: TraverseOptions): Generator<VertexWithId<Vertex>> {
    for (const id of this.traverseIds(options)) {
      yield { id, vertex: this.graph.getVertex(id) } as VertexWithId<Vertex>;
    }
  }
}

export class GraphTraversal<Vertex, Edge> extends BaseGraphTraversal<Vertex, Edge> {
  static create<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    strategy: 'DFS' | 'BFS'
  ): ITraversal<Vertex> {
    return new GraphTraversal<Vertex, Edge>(graph, strategy);
  }

  static bfs<Vertex, Edge>(graph: IDiGraph<Vertex, Edge>): ITraversal<Vertex> {
    return this.create(graph, 'BFS');
  }

  static dfs<Vertex, Edge>(graph: IDiGraph<Vertex, Edge>): ITraversal<Vertex> {
    return this.create(graph, 'DFS');
  }

  constructor(
    protected graph: IDiGraph<Vertex, Edge>,
    protected strategy: 'DFS' | 'BFS'
  ) {
    super(graph);
  }

  *traverseIds(options?: TraverseOptions): Generator<string> {
    const startVertexId = options?.startVertexId;
    const depthLimit = options?.depthLimit ?? Number.POSITIVE_INFINITY;
    const queue: { vertex: string; depth: number }[] = [];
    const isDFS = this.strategy === 'DFS';
    const visited = options?.visited ?? new Set<string>();

    this.initializeQueue(queue, startVertexId);

    while (queue.length > 0) {
      const { vertex, depth } = queue.pop()!;

      if (visited.has(vertex)) {
        continue;
      }

      visited.add(vertex);
      yield vertex;

      if (depth < depthLimit) {
        this.addDescendantsToQueue(queue, vertex, depth, visited, isDFS);
      }
    }
  }

  private initializeQueue(
    queue: { vertex: string; depth: number }[],
    startVertexId?: string
  ): void {
    if (!startVertexId) {
      const vertices = Array.from(this.graph.getVertexIds()).reverse();
      queue.push(...vertices.map((id) => ({ vertex: id, depth: 0 })));
    } else {
      if (!this.graph.hasVertex(startVertexId)) {
        throw new Error(`Vertex does not exist in the graph: ${startVertexId}`);
      }
      queue.push({ vertex: startVertexId, depth: 0 });
    }
  }

  private addDescendantsToQueue(
    queue: { vertex: string; depth: number }[],
    vertex: string,
    depth: number,
    visited: Set<string>,
    isDFS: boolean
  ): void {
    const descendants = Array.from(this.graph.getDescendantIds(vertex))
      .filter((id) => !visited.has(id))
      .reverse()
      .map((id) => ({ vertex: id, depth: depth + 1 }));

    if (isDFS) {
      queue.push(...descendants);
    } else {
      queue.unshift(...descendants);
    }
  }
}

export class DescendantTraversal<Vertex, Edge> extends BaseGraphTraversal<Vertex, Edge> {
  static create<Vertex, Edge>(graph: IDiGraph<Vertex, Edge>): ITraversal<Vertex> {
    return new DescendantTraversal<Vertex, Edge>(graph);
  }

  static *getDeepDescendantIds<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit?: number
  ): Generator<string> {
    for (const vertexId of this.create(graph).traverseIds({ startVertexId, depthLimit })) {
      if (vertexId !== startVertexId) {
        yield vertexId;
      }
    }
  }

  static *getDeepDescendants<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit?: number
  ): Generator<{ id: string; vertex: Vertex }> {
    for (const id of this.getDeepDescendantIds(graph, startVertexId, depthLimit)) {
      yield { id, vertex: graph.getVertex(id)! };
    }
  }

  *traverseIds(options?: TraverseOptions): Generator<string> {
    if (!options?.startVertexId) {
      throw new Error('Start vertex ID is required for descendant traversal.');
    }
    const bfs = GraphTraversal.bfs(this.graph);
    for (const id of bfs.traverseIds(options)) {
      if (id !== options.startVertexId) {
        yield id;
      }
    }
  }
}

export class AncestorTraversal<Vertex, Edge> extends BaseGraphTraversal<Vertex, Edge> {
  static create<Vertex, Edge>(graph: IDiGraph<Vertex, Edge>): ITraversal<Vertex> {
    return new AncestorTraversal<Vertex, Edge>(graph);
  }

  static *getDeepAncestorIds<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit?: number
  ): Generator<string> {
    for (const vertexId of this.create(graph).traverseIds({ startVertexId, depthLimit })) {
      if (vertexId !== startVertexId) {
        yield vertexId;
      }
    }
  }

  static *getDeepAncestors<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit?: number
  ): Generator<{ id: string; vertex: Vertex }> {
    for (const id of this.getDeepAncestorIds(graph, startVertexId, depthLimit)) {
      yield { id, vertex: graph.getVertex(id)! };
    }
  }

  constructor(protected graph: IDiGraph<Vertex, Edge>) {
    super(graph);
  }

  *traverseIds(options?: TraverseOptions): Generator<string> {
    const startVertexId = options?.startVertexId;
    const depthLimit = options?.depthLimit ?? Number.POSITIVE_INFINITY;
    if (!startVertexId) {
      throw new Error('Start vertex ID is required for ancestor traversal.');
    }
    const queue: { vertex: string; depth: number }[] = [];
    queue.push({ vertex: startVertexId, depth: 0 });

    const visited = new Set<string>();

    while (queue.length > 0) {
      const { vertex, depth } = queue.shift()!;

      if (visited.has(vertex)) {
        continue;
      }

      visited.add(vertex);
      yield vertex;

      if (depth < depthLimit) {
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
