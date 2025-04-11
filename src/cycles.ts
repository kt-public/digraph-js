import { DiGraph } from './digraph';
import { DiGraphDict, ICycles, IDiGraph } from './interface';

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
export class CyclesSimple<Vertex, Edge> extends CyclesBase<Vertex, Edge> {
  constructor(graph: IDiGraph<Vertex, Edge>) {
    super(graph);
  }

  *findCycles(depthLimit: number = Number.POSITIVE_INFINITY): Generator<string[]> {
    const stack: string[] = [];
    const onStack = new Set<string>();
    const cycleKeys = new Set<string>();
    const thisGraph = this.graph;

    function* dfs(node: string, depth: number, path: Set<string>): Generator<string[]> {
      if (depth + 1 > depthLimit) return;

      stack.push(node);
      onStack.add(node);
      path.add(node);

      for (const neighbor of thisGraph.getDescendantIds(node)) {
        if (!path.has(neighbor)) {
          // Explore the neighbor
          yield* dfs(neighbor, depth + 1, new Set(path));
        } else if (onStack.has(neighbor)) {
          // Cycle detected
          const cycleStartIndex = stack.indexOf(neighbor);
          const cycle = stack.slice(cycleStartIndex);
          // cycle.push(neighbor); // Close the cycle
          const cycleKey = [...cycle].sort((a, b) => a.localeCompare(b)).join(',');
          if (!cycleKeys.has(cycleKey)) {
            cycleKeys.add(cycleKey);
            yield cycle;
          } else {
            continue; // Skip duplicate cycles
          }
        }
      }

      stack.pop();
      onStack.delete(node);
    }

    for (const vertex of this.graph.getVertexIds()) {
      yield* dfs(vertex, 0, new Set());
    }
  }
}

export class CyclesJohnson<Vertex, Edge> extends CyclesBase<Vertex, Edge> {
  constructor(graph: IDiGraph<Vertex, Edge>) {
    super(graph);
  }

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
    //const cycles: string[][] = [];
    const thisGraph = this.cloneSimpleGraph();

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
          // cycle.push(start); // close the cycle
          yield cycle;
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
    for (let i = 0; i < vertices.length; i++) {
      const startVertex = vertices[i];
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
