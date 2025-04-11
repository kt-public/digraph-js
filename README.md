[![CI](https://github.com/kt-public/digraph-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kt-public/digraph-js/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=bugs)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)

# ya-digraph-js

Yet another graph module.

Based on the idea of https://github.com/antoine-coulon/digraph-js

Make Directed Graphs traversal and construction effortless, also includes deep circular dependency detection.

# Dual-type package

This package is compiled into a dual-type module es6 and commonjs, so it can be used in both environments. For example, azure functions have issues at the moment with using es6 modules.

# Functionality split

## DiGraph

DiGraph class takes care of only managing the vertices, edges, and bound bodies to vertices and edges.

```ts
const digraph = new DiGraph<Vertex, Edge>();
const vertexA: VertexWithId<Vertex> = { id: 'a', vertex: {} };
const vertexE: VertexWithId<Vertex> = { id: 'e', vertex: {} };
const vertexB: VertexWithId<Vertex> = { id: 'b', vertex: {} };

digraph.addVertices(vertexA, vertexB, vertexE);
digraph.addEdges({ from: vertexE.id, to: vertexA.id });
digraph.getDescendantIds(someId);
digraph.getDescendants(someId);
digraph.getAncestorIds(someId);
digraph.getAncestors(someId);
```

## Traversal

Traversal functionality is for different traversion over the graph: DFS, BFS, deep descendants, deep ancestors

```ts
let bfs = GraphTraversal.bfs(graph);
// Traverse over ids of vertices
bfs.traverseIds();
bfs.traverseIds({ startVertexId: '1' });
bfs.traverseIds({ startVertexId: '1', depthLimit: 2 });
// Traverse over nodes as {id, vertex}
bfs.traverse();
bfs.traverse({ startVertexId: '1' });
bfs.traverse({ startVertexId: '1', depthLimit: 2 });
let dfs = GraphTraversal.dfs(graph);
// Deep descendants
const childrenIds = DescendantTraversal.getDeepDescendantIds(graph, '1');
const children = DescendantTraversal.getDeepDescendant(graph, '1');
const ancestorsIds = AncestorTraversal.getDeepAncestorIds(graph, '4');
const ancestors = AncestorTraversal.getDeepAncestor(graph, '4');
```

## Cycles

Functionality for detecting cycles in the graph.

```ts
// Simple graph detection, less performant, supports depthLimit
const cycles = new CyclesSimple(graph);
const cycles = new CyclesSimple(graph);
expect(cycles.hasCycles(1)).to.equal(false);
expect(cycles.hasCycles(2)).to.equal(true);
const foundCycles = Array.from(cycles.findCycles(2));
expect(foundCycles).to.deep.equal([['a', 'c']]);

// Johnson's cycle detection, supposedly most performant of existing, does not support depthLimit
// https://www.cs.tufts.edu/comp/150GA/homeworks/hw1/Johnson%2075.PDF
// https://epubs.siam.org/doi/10.1137/0205007

const cycles = new CyclesJohnson(digraph);
digraph.addEdges({ from: vertexD.id, to: vertexA.id });
expect(cycles.hasCycles()).to.equal(true);
const foundCycles = Array.from(cycles.findCycles());
expect(foundCycles).to.deep.equal([['a', 'b', 'c', 'd']]);
```
