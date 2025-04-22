import { describe, it } from 'vitest';
import { DiGraph, GraphPaths, VertexWithId } from '../src/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Vertex = Record<string, any>;

function* createRawVertices(...ids: string[]): Generator<VertexWithId<Vertex>> {
  for (const id of ids) {
    yield {
      id,
      vertex: {}
    };
  }
}

describe('Graph Paths', () => {
  describe('getPathsFrom', () => {
    it('should return all paths from a given vertex, depthLimit = INFINITY', ({ expect }) => {
      const graph = new DiGraph<Vertex>();
      const vertices = [...createRawVertices('1', '2', '3', '4', '5', '6', '7', '8', '9', '10')];
      graph.addVertices(...vertices);
      graph.addEdges({ from: '1', to: '2' });
      graph.addEdges({ from: '2', to: '3' });
      graph.addEdges({ from: '3', to: '4' });
      graph.addEdges({ from: '1', to: '5' });
      graph.addEdges({ from: '5', to: '6' });
      graph.addEdges({ from: '6', to: '7' });
      graph.addEdges({ from: '5', to: '8' });
      graph.addEdges({ from: '1', to: '9' });
      graph.addEdges({ from: '9', to: '10' });
      graph.addEdges({ from: '10', to: '4' });
      const paths = new GraphPaths(graph);
      const result = [...paths.getPathsFrom(graph, '1')];
      const expected = [
        ['1', '2', '3', '4'],
        ['1', '5', '6', '7'],
        ['1', '5', '8'],
        ['1', '9', '10', '4']
      ];
      expect(result).toEqual(expected);
    });
    it('should return all paths from a given vertex, depthLimit = 3', ({ expect }) => {
      const graph = new DiGraph<Vertex>();
      const vertices = [...createRawVertices('1', '2', '3', '4', '5', '6', '7', '8', '9', '10')];
      graph.addVertices(...vertices);
      graph.addEdges({ from: '1', to: '2' });
      graph.addEdges({ from: '2', to: '3' });
      graph.addEdges({ from: '3', to: '4' });
      graph.addEdges({ from: '1', to: '5' });
      graph.addEdges({ from: '5', to: '6' });
      graph.addEdges({ from: '6', to: '7' });
      graph.addEdges({ from: '5', to: '8' });
      graph.addEdges({ from: '1', to: '9' });
      graph.addEdges({ from: '9', to: '10' });
      graph.addEdges({ from: '10', to: '4' });
      const paths = new GraphPaths(graph);
      const result = [...paths.getPathsFrom(graph, '1', 2)];
      const expected = [
        ['1', '2', '3'],
        ['1', '5', '6'],
        ['1', '5', '8'],
        ['1', '9', '10']
      ];
      expect(result).toEqual(expected);
    });
  });
});
