import _ from 'lodash';

export type Traversal = 'bfs' | 'dfs';

export type VertexRawSerialized = {
  id: string;
  adjacentTo: string[];
};

export type EdgeRaw = {
  from: string;
  to: string;
};

export type VertexRaw = {
  id: string;
  adjacentTo: Set<string>;
};

export function toVertexRaw(vertex: VertexRawSerialized): VertexRaw {
  return {
    id: vertex.id,
    adjacentTo: new Set(vertex.adjacentTo)
  };
}

export function toVertexRawSerialized(vertex: VertexRaw): VertexRawSerialized {
  return {
    id: vertex.id,
    adjacentTo: Array.from(vertex.adjacentTo)
  };
}

export class DiGraphRaw {
  getVertex(id: string): VertexRaw | undefined {
    return this.#vertices.get(id);
  }
  #vertices: Map<string, VertexRaw>;

  constructor() {
    this.#vertices = new Map();
  }

  static fromRaw(raw: Record<string, VertexRawSerialized>): DiGraphRaw {
    const digraph = new DiGraphRaw();

    for (const vertex of Object.values(raw)) {
      digraph.addVertex({
        id: vertex.id,
        adjacentTo: new Set(vertex.adjacentTo)
      });
    }

    return digraph;
  }

  public get isAcyclic(): boolean {
    return !this.hasCycles();
  }

  public toDict(): Record<string, VertexRawSerialized> {
    const entries = Array.from(this.#vertices.entries()).map(
      ([key, value]) =>
        [key, { ...value, adjacentTo: Array.from(value.adjacentTo) }] as [
          string,
          VertexRawSerialized
        ]
    );
    return Object.fromEntries(entries);
  }

  public hasVertex(vertexId: string): boolean {
    return this.#vertices.has(vertexId);
  }

  public addVertex(vertex: VertexRaw | VertexRawSerialized): void {
    // Check if vertex already exists
    if (this.#vertices.has(vertex.id)) {
      throw new Error(`Vertex already exists: ${vertex.id}`);
    }
    this.#vertices.set(vertex.id, {
      id: vertex.id,
      adjacentTo: new Set(vertex.adjacentTo)
    });
  }

  public addVertices(...vertices: VertexRaw[] | VertexRawSerialized[]): void {
    // Check that there are no duplicates in the provided vertices, throw error with the list of duplicates
    const duplicates = vertices.filter(
      (vertex, index) => vertices.findIndex((v) => v.id === vertex.id) !== index
    );
    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate vertices found: ${duplicates.map((vertex) => vertex.id).join(', ')}`
      );
    }
    // Check if some of the vertices alread exists in the graph
    const existingVertices = vertices.filter((vertex) => this.#vertices.has(vertex.id));
    if (existingVertices.length > 0) {
      throw new Error(
        `Some vertices already exist: ${existingVertices.map((vertex) => vertex.id).join(', ')}`
      );
    }
    // Add vertices to the graph
    for (const vertex of vertices) {
      this.addVertex(vertex);
    }
  }

  public deleteVertex(vertexId: string): void {
    // Check if vertex exists
    if (!this.#vertices.has(vertexId)) {
      throw new Error(`Vertex not found: ${vertexId}`);
    }
    // Delete vertex and edges to this vertex
    this.#vertices.delete(vertexId);
    for (const vertex of this.#vertices.values()) {
      if (vertex.adjacentTo.has(vertexId)) {
        vertex.adjacentTo.delete(vertexId);
      }
    }
  }

  public addEdge({ from, to }: EdgeRaw): void {
    // Check self-loop
    if (from === to) {
      throw new Error('Self-loop is not allowed');
    }

    // Check if vertices exist
    const fromVertex = this.#vertices.get(from);
    if (!fromVertex) {
      throw new Error(`Vertex not found: ${from}`);
    }
    const toVertex = this.#vertices.get(to);
    if (!toVertex) {
      throw new Error(`Vertex not found: ${to}`);
    }
    // Check if edge already exists
    if (fromVertex.adjacentTo.has(to)) {
      throw new Error(`Edge already exists: ${from} -> ${to}`);
    }
    // Add edge
    fromVertex.adjacentTo.add(to);
  }

  public deleteEdge({ from, to }: EdgeRaw): void {
    const fromVertex = this.#vertices.get(from);
    if (!fromVertex) {
      throw new Error(`Vertex not found: ${from}`);
    }
    const toVertex = this.#vertices.get(to);
    if (!toVertex) {
      throw new Error(`Vertex not found: ${to}`);
    }
    if (!fromVertex.adjacentTo.has(to)) {
      throw new Error(`Edge not found: ${from} -> ${to}`);
    }
    fromVertex.adjacentTo.delete(to);
  }

  /**
   * Base API to traverse walk through a DiGraph instance either in a DFS or BFS
   * manner. Providing `rootVertexId` will force the traversal to start from it.
   * If no `rootVertexId` is provided, the traversal will start from the first vertex
   * found in the graph, which will most likely be the first entry that was added
   * in it.
   */
  public *traverse(options?: {
    rootVertexId?: string;
    traversal?: Traversal;
  }): Generator<VertexRaw, void, void> {
    const { rootVertexId, traversal } = {
      traversal: options?.traversal ?? 'bfs',
      rootVertexId: options?.rootVertexId
    };

    if (rootVertexId) {
      if (traversal === 'bfs') {
        return yield* this.breadthFirstTraversalFrom(rootVertexId);
      }

      return yield* this.depthFirstTraversalFrom(rootVertexId);
    }

    return yield* this.traverseAll(traversal);
  }

  public traverseEager(options?: { rootVertexId?: string; traversal?: Traversal }): VertexRaw[] {
    return Array.from(this.traverse(options));
  }

  /**
   * Allows top-to-bottom traversals by finding only the first relationship level
   * of children dependencies of the provided vertex.
   * @example
   * // given A --> B, A depends on B hence B is a children dependency of A
   * assert.deepEqual(graph.getChildren("A"), [VertexB]) // ok
   */
  public getChildren(rootVertexId: string): VertexRaw[] {
    // Check if vertex exists
    const rootVertex = this.#vertices.get(rootVertexId);
    if (!rootVertex) {
      throw new Error(`Vertex not found: ${rootVertexId}`);
    }

    // Return children vertices directly
    return Array.from(rootVertex.adjacentTo, (vertexId) => {
      const vertex = this.#vertices.get(vertexId);
      if (!vertex) {
        throw new Error(`Vertex not found: ${vertexId}`);
      }
      return vertex;
    });
  }

  /**
   * Same as `getChildren()`, but doesn't stop at the first level hence deeply
   * collects all children dependencies in a Depth-First Search manner.
   * Allows top-to-bottom traversals i.e: which nodes are dependencies of
   * the provided rootVertexId.
   */
  public *getDeepChildren(rootVertexId: string, depthLimit?: number): Generator<string> {
    const rootVertex = this.#vertices.get(rootVertexId);
    if (!rootVertex) {
      throw new Error(`Vertex not found: ${rootVertexId}`);
    }

    const visitedVertices: string[] = [];

    for (const adjacentVertexId of rootVertex.adjacentTo) {
      const adjacentVertex = this.#vertices.get(adjacentVertexId);
      if (!adjacentVertex) {
        throw new Error(`Vertex not found: ${adjacentVertexId}`);
      }
      yield* this.findDeepDependencies(
        'top-to-bottom',
        rootVertex,
        adjacentVertex,
        depthLimit,
        visitedVertices
      );
    }
  }

  /**
   * Allows bottom-to-top traversals by finding only the first relationship level
   * of parent dependencies of the provided vertex.
   * @example
   * // given A --> B, A depends on B hence A is a parent dependency of B
   * assert.deepEqual(graph.getParents("B"), [VertexA]) // ok
   */
  public getParents(rootVertexId: string): VertexRaw[] {
    // Check if vertex exists
    if (!this.#vertices.has(rootVertexId)) {
      throw new Error(`Vertex not found: ${rootVertexId}`);
    }

    const parents: VertexRaw[] = [];
    for (const vertex of this.#vertices.values()) {
      if (vertex.adjacentTo.has(rootVertexId)) {
        parents.push(vertex);
      }
    }

    return parents;
  }

  /**
   * Same as `getParents()`, but doesn't stop at the first level hence deeply
   * collects all parent dependencies in a Depth-First Search manner.
   * Allows bottom-to-top traversals i.e: which nodes are depending on
   * the provided rootVertexId.
   */
  public *getDeepParents(rootVertexId: string, depthLimit?: number): Generator<string> {
    const rootVertex = this.#vertices.get(rootVertexId);
    if (!rootVertex) {
      return;
    }

    const visitedVertices: string[] = [];

    for (const adjacentVertex of this.getParents(rootVertex.id)) {
      yield* this.findDeepDependencies(
        'bottom-to-top',
        rootVertex,
        adjacentVertex,
        depthLimit,
        visitedVertices
      );
    }
  }

  /**
   * Returns `true` if atleast one circular dependency exists in the graph,
   * otherwise, returns `false`.
   * If you want to know precisely what are the circular dependencies and
   * know what vertices are involved, use `findCycles()` instead.
   */
  public hasCycles({ maxDepth } = { maxDepth: Number.POSITIVE_INFINITY }): boolean {
    let hasCycles = false;

    if (maxDepth === 0) {
      return hasCycles;
    }

    for (const [rootVertex, rootAdjacentVertex] of this.collectRootAdjacencyLists()) {
      // early exit as we stop on the first cycle found
      if (hasCycles) {
        break;
      }
      const adjacencyList = new Set<string>();
      for (const deepAdjacentVertexId of this.findDeepDependencies(
        'top-to-bottom',
        rootVertex,
        rootAdjacentVertex,
        maxDepth
      )) {
        adjacencyList.add(deepAdjacentVertexId);

        if (deepAdjacentVertexId === rootVertex.id || adjacencyList.has(rootVertex.id)) {
          hasCycles = true;
          break;
        }
      }
    }

    return hasCycles;
  }

  public findCycles({ maxDepth } = { maxDepth: Number.POSITIVE_INFINITY }): string[][] {
    const cyclicPathsWithMaybeDuplicates: string[][] = [];

    if (maxDepth === 0) {
      return [];
    }

    for (const [rootVertex, rootAdjacentVertex] of this.collectRootAdjacencyLists()) {
      const adjacencyList = new Set<string>();

      for (const deepAdjacentVertexId of this.findDeepDependencies(
        'top-to-bottom',
        rootVertex,
        rootAdjacentVertex,
        maxDepth
      )) {
        adjacencyList.add(deepAdjacentVertexId);

        if (deepAdjacentVertexId === rootVertex.id || adjacencyList.has(rootVertex.id)) {
          const adjacencyListAsArray = [...adjacencyList];
          /**
           * We found a cycle, the first thing to do is to only keep the segment
           * from X to X with "X" being the root vertex of the current DFS.
           * It allows us to build sub cycles at any point in the path.
           */
          const verticesInBetweenCycle = adjacencyListAsArray.slice(
            0,
            adjacencyListAsArray.indexOf(rootVertex.id) + 1
          );
          cyclicPathsWithMaybeDuplicates.push(
            this.backtrackVerticesInvolvedInCycle([rootVertex.id, ...verticesInBetweenCycle])
          );
        }
      }
    }

    return this.keepUniqueVerticesPaths([...cyclicPathsWithMaybeDuplicates]);
  }

  private *limitCycleDetectionDepth(dependenciesWalker: Generator<string>, maxDepth: number) {
    /**
     * At this point, we already traversed 2 levels of depth dependencies by:
     * - accessing the root's node adjacency list (depth === 1)
     * - then we continue by accessing the adjacent's node adjacency list (depth === 2)
     * Consequently we start recursing using the limit only at depth 2 already
     */
    const TRAVERSAL_STEPS_ALREADY_DONE = 2;
    for (let depth = 0; depth <= maxDepth - TRAVERSAL_STEPS_ALREADY_DONE; depth++) {
      const { done, value } = dependenciesWalker.next();
      if (done) {
        return;
      }
      yield value;
    }
  }

  private *collectRootAdjacencyLists(): Generator<[VertexRaw, VertexRaw]> {
    for (const rootVertex of this.#vertices.values()) {
      for (const rootAdjacentVertexId of rootVertex.adjacentTo) {
        const rootAdjacentVertex = this.#vertices.get(rootAdjacentVertexId);
        if (!rootAdjacentVertex) {
          continue;
        }

        yield [rootVertex, rootAdjacentVertex];
      }
    }
  }

  /**
   * This method is used to deeply find either all lower dependencies of a given
   * vertex or all its upper dependencies.
   */
  // eslint-disable-next-line max-params
  private *findDeepDependencies(
    dependencyTraversal: 'bottom-to-top' | 'top-to-bottom',
    rootVertex: VertexRaw,
    traversedVertex: VertexRaw,
    depthLimit: number = Number.POSITIVE_INFINITY,
    verticesAlreadyVisited: string[] = []
  ): Generator<string> {
    if (verticesAlreadyVisited.includes(traversedVertex.id)) {
      return;
    }

    yield traversedVertex.id;
    verticesAlreadyVisited.push(traversedVertex.id);

    // Cycle reached, we must exit before entering in the infinite loop
    if (rootVertex.id === traversedVertex.id) {
      return;
    }

    const nextDependencies =
      dependencyTraversal === 'top-to-bottom'
        ? traversedVertex.adjacentTo
        : this.getParents(traversedVertex.id).map(({ id }) => id);

    for (const adjacentVertexId of nextDependencies) {
      const adjacentVertex = this.#vertices.get(adjacentVertexId);
      if (adjacentVertex) {
        yield* this.limitCycleDetectionDepth(
          this.findDeepDependencies(
            dependencyTraversal,
            rootVertex,
            adjacentVertex,
            depthLimit,
            verticesAlreadyVisited
          ),
          depthLimit
        );
      }
    }
  }

  private keepUniqueVerticesPaths(paths: string[][]): string[][] {
    return _.uniqWith(paths, (pathA, pathB) => {
      // Narrow down the comparison to avoid unnecessary operations
      if (pathA.length !== pathB.length) {
        return false;
      }

      /**
       * In order for paths to be compared by values, arrays must be sorted e.g:
       * [a, b] !== [b, a] when strictly comparing values.
       */
      return _.isEqual(pathA.slice().sort(), pathB.slice().sort());
    });
  }

  /**
   * Once the cycle found, many vertices actually not involved in the cycle
   * might have been visited. To only keep vertices that are effectively involved
   * in the cyclic path, we must check that for any vertex there is an existing
   * path from its ancestor leading to the root node.
   */
  private backtrackVerticesInvolvedInCycle(verticesInCyclicPath: string[]): string[] {
    for (let i = verticesInCyclicPath.length; i > 1; i--) {
      const currentNode = verticesInCyclicPath[i - 1];
      // The node just before the current one who is eventually its parent
      const nodeBeforeInPath = this.#vertices.get(verticesInCyclicPath[i - 2]);
      const isCurrentNodeParent = nodeBeforeInPath?.adjacentTo.has(currentNode);
      /**
       * there is no path existing from the node just before to the current node,
       * meaning that the cycle path can't be coming from that path.
       */
      if (!isCurrentNodeParent) {
        // We must remove incrementally vertices that aren't involved in the cycle
        verticesInCyclicPath.splice(i - 2, 1);
      }
    }

    return [...new Set(verticesInCyclicPath)];
  }

  private *depthFirstTraversalFrom(
    rootVertexId: string,
    traversedVertices = new Set<string>()
  ): Generator<VertexRaw, void, void> {
    if (traversedVertices.has(rootVertexId)) {
      return;
    }

    const rootVertex = this.#vertices.get(rootVertexId);

    if (!rootVertex) {
      return;
    }

    yield rootVertex;
    traversedVertices.add(rootVertexId);

    for (const vertexId of rootVertex.adjacentTo) {
      yield* this.depthFirstTraversalFrom(vertexId, traversedVertices);
    }
  }

  private *breadthFirstTraversalFrom(
    rootVertexId: string,
    visitedVerticesIds = new Set<string>()
  ): Generator<VertexRaw, void, void> {
    const vertex = this.#vertices.get(rootVertexId);

    if (!vertex) return;

    if (!visitedVerticesIds.has(rootVertexId)) {
      visitedVerticesIds.add(rootVertexId);
      yield vertex;
    }

    const nextVerticesToVisit: VertexRaw[] = [];
    for (const vertexId of vertex.adjacentTo) {
      const adjacentVertex = this.#vertices.get(vertexId);

      if (!adjacentVertex || visitedVerticesIds.has(adjacentVertex.id)) continue;

      visitedVerticesIds.add(adjacentVertex.id);
      nextVerticesToVisit.push(adjacentVertex);
      yield adjacentVertex;
    }

    for (const nextVertex of nextVerticesToVisit) {
      yield* this.breadthFirstTraversalFrom(nextVertex.id, visitedVerticesIds);
    }
  }

  private *traverseAll(traversal: Traversal) {
    const visitedVertices = new Set<string>();

    for (const vertexId of this.#vertices.keys()) {
      if (traversal === 'dfs') {
        yield* this.depthFirstTraversalFrom(vertexId, visitedVertices);
      } else {
        yield* this.breadthFirstTraversalFrom(vertexId, visitedVertices);
      }
    }
  }
}
