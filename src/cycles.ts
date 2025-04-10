import { ICycles, IDiGraph } from './interface';

export class Cycles<Vertex, Edge> implements ICycles {
  constructor(private graph: IDiGraph<Vertex, Edge>) {}

  hasCycles(depthLimit?: number): boolean {
    for (const cycle of this.findCycles(depthLimit)) {
      return true;
    }
    return false;
  }
  *findCycles(depthLimit: number = Number.POSITIVE_INFINITY): Generator<string[]> {
    const visited = new Set<string>();
    const stack = new Set<string>();
    const path: string[] = [];

    for (const id of this.graph.getVertexIds()) {
      if (!visited.has(id)) {
        yield* this.dfs(id, visited, stack, path, depthLimit);
      }
    }
  }
  private *dfs(
    id: string,
    visited: Set<string>,
    stack: Set<string>,
    path: string[],
    depthLimit: number
  ): Generator<string[]> {
    if (path.length > depthLimit) {
      return;
    }
    visited.add(id);
    stack.add(id);
    path.push(id);

    for (const childId of this.graph.getDescendantIds(id)) {
      if (!visited.has(childId)) {
        yield* this.dfs(childId, visited, stack, path, depthLimit);
      } else if (stack.has(childId)) {
        yield [...path, childId];
      }
    }

    stack.delete(id);
    path.pop();
  }
}
