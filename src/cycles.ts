import { DiGraph } from './digraph.js';
import { DiGraphDict, ICycles, IDiGraph } from './interface.js';

abstract class CyclesBase<Vertex, Edge> implements ICycles<Vertex, Edge> {
  constructor(public readonly graph: IDiGraph<Vertex, Edge>) {}
  hasCycles(depthLimit?: number): boolean {
    for (const _ of this.findCycles(depthLimit)) {
      return true;
    }
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findCycles(depthLimit?: number): Generator<string[]> {
    throw new Error('Method not implemented.');
  }
}
export class CyclesDFS<Vertex, Edge> extends CyclesBase<Vertex, Edge> {
  *findCycles(depthLimit: number = Number.POSITIVE_INFINITY): Generator<string[]> {
    const visited = new Set<string>();
    const stack: string[] = [];
    const stackSet = new Set<string>();
    const thisGraph = this.graph;
    const cycleKeys = new Set<string>();

    function* dfs(vertex: string, depth: number): Generator<string[]> {
      if (depth + 1 > depthLimit) return;

      visited.add(vertex);
      stack.push(vertex);
      stackSet.add(vertex);

      for (const neighbor of thisGraph.getDescendantIds(vertex)) {
        if (stackSet.has(neighbor)) {
          // Cycle detected
          const cycleStartIndex = stack.indexOf(neighbor);
          const cycle = stack.slice(cycleStartIndex);
          const cycleKey = [...cycle].sort((a, b) => a.localeCompare(b)).join(',');
          if (!cycleKeys.has(cycleKey)) {
            cycleKeys.add(cycleKey);
            // cycle.push(neighbor); // close the cycle
            yield cycle;
          }
        } else if (!visited.has(neighbor)) {
          yield* dfs(neighbor, depth + 1);
        }
      }

      stack.pop();
      stackSet.delete(vertex);
    }

    for (const vertex of thisGraph.getVertexIds()) {
      if (!visited.has(vertex)) {
        yield* dfs(vertex, 0);
      }
    }
  }
}

export class CyclesJohnson<Vertex, Edge> extends CyclesBase<Vertex, Edge> {
  private cloneSimpleGraph(): IDiGraph<never, never> {
    const dict = this.graph.toDict();
    // Adjust dict to remove edges and vertices
    const simpleDict: DiGraphDict<never, never> = {
      // this is Record<string, undefined>
      vertices: Object.fromEntries(
        Object.entries(dict.vertices).map(([id]) => [id, undefined as never])
      ),
      // this is Record<string, Record<string, undefined>>
      edges: Object.fromEntries(
        Object.entries(dict.edges).map(([from, edges]) => [
          from,
          Object.fromEntries(Object.entries(edges).map(([to]) => [to, undefined as never]))
        ])
      )
    };
    return DiGraph.fromDict(simpleDict);
  }

  *findCycles(depthLimit?: number): Generator<string[]> {
    if (depthLimit !== undefined) {
      throw new Error("Depth limit is not supported in Johnson's algorithm");
    }
    const blocked = new Set<string>();
    const blockMap = new Map<string, Set<string>>();
    const stack: string[] = [];
    const thisGraph = this.cloneSimpleGraph();
    const cycleKeys = new Set<string>();

    function unblock(node: string) {
      blocked.delete(node);
      if (blockMap.has(node)) {
        for (const w of blockMap.get(node)!) {
          if (blocked.has(w)) {
            unblock(w);
          }
        }
        blockMap.delete(node);
      }
    }

    function* circuit(v: string, start: string): Generator<string[]> {
      let foundCycle = false;
      stack.push(v);
      blocked.add(v);

      for (const w of thisGraph.getDescendantIds(v)) {
        if (w === start) {
          // Cycle found
          const cycle = [...stack];
          const cycleKey = [...cycle].sort((a, b) => a.localeCompare(b)).join(',');
          if (!cycleKeys.has(cycleKey)) {
            cycleKeys.add(cycleKey);
            // cycle.push(start); // close the cycle
            yield cycle;
          }
          foundCycle = true;
        } else if (!blocked.has(w)) {
          const subCycles = yield* circuit(w, start);
          foundCycle = foundCycle || !!subCycles;
        }
      }

      if (foundCycle) {
        unblock(v);
      } else {
        for (const w of thisGraph.getDescendantIds(v)) {
          if (!blockMap.has(w)) {
            blockMap.set(w, new Set());
          }
          blockMap.get(w)!.add(v);
        }
      }

      stack.pop();
      return foundCycle;
    }

    const vertices = [...thisGraph.getVertexIds()];
    for (const startVertex of vertices) {
      yield* circuit(startVertex, startVertex);

      // Remove processed vertex and its edges
      thisGraph.deleteVertices(startVertex);
      blocked.clear();
      blockMap.clear();
    }

    // Restore the original graph structure if needed
    // (depends on whether `removeVertex` modifies the graph permanently)
  }
}
