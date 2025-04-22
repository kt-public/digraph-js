import { IDiGraph } from './interface';

export class GraphPaths<Vertex, Edge> {
  constructor(private graph: IDiGraph<Vertex, Edge>) {}

  *getPathsFrom<Vertex, Edge>(
    graph: IDiGraph<Vertex, Edge>,
    startVertexId: string,
    depthLimit: number = Number.POSITIVE_INFINITY
  ): Generator<string[]> {
    function* dfs(
      currentVertex: string,
      path: string[],
      pathSet: Set<string>,
      depth: number
    ): Generator<string[]> {
      if (depth > depthLimit) {
        yield [...path]; // Return the current path
        return;
      }

      path.push(currentVertex);
      pathSet.add(currentVertex);

      const neighbors = [...graph.getDescendantIds(currentVertex)];
      if (!neighbors || neighbors.length === 0) {
        // Leaf node
        yield [...path]; // Return the current path
      } else {
        for (const neighbor of neighbors) {
          // Check if this is cycle
          if (pathSet.has(neighbor)) {
            // Cycle detected
            yield [...path]; // Return the current path
            continue; // Skip to the next neighbor
          }
          // Continue DFS
          yield* dfs(neighbor, path, pathSet, depth + 1);
        }
      }

      // Backtrack
      path.pop();
      pathSet.delete(currentVertex);
    }

    yield* dfs(startVertexId, [], new Set(), 0);
  }
}
