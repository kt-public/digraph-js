[![CI](https://github.com/kt-public/digraph-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kt-public/digraph-js/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=bugs)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=coverage)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)

# ya-digraph-js

Yet another graph module.

Based on the idea of https://github.com/antoine-coulon/digraph-js

Make Directed Graphs traversal and construction effortless, also includes deep circular dependency detection.

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
// BFS
let bfs = GraphTraversal.bfs(graph);
// Traverse over ids of vertices
const ids = bfs.traverseIds();
const ids = bfs.traverseIds({ startVertexId: '1' });
const ids = bfs.traverseIds({ startVertexId: '1', depthLimit: 2 });
// Traverse over nodes as {id, vertex}
const verticesWithIds = bfs.traverse();
const verticesWithIds = bfs.traverse({ startVertexId: '1' });
const verticesWithIds = bfs.traverse({ startVertexId: '1', depthLimit: 2 });

// DFS
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
// Classical DFS graph cycle detection, only one cycle (if any) per node is detected, supports depthLimit
const cycles = new CyclesDFS(graph);
expect(cycles.hasCycles(1)).to.equal(false);
expect(cycles.hasCycles(2)).to.equal(true);
const foundCycles = Array.from(cycles.findCycles(2));
expect(foundCycles).to.deep.equal([['a', 'c']]);

// Johnson's cycle detection, supposedly most performant of existing, does not support depthLimit
// All elementary cycles are detected, multiple cycles per node possible
// https://www.cs.tufts.edu/comp/150GA/homeworks/hw1/Johnson%2075.PDF
// https://epubs.siam.org/doi/10.1137/0205007
const cycles = new CyclesJohnson(digraph);
digraph.addEdges({ from: vertexD.id, to: vertexA.id });
expect(cycles.hasCycles()).to.equal(true);
const foundCycles = Array.from(cycles.findCycles());
expect(foundCycles).to.deep.equal([['a', 'b', 'c', 'd']]);
```

# Benchmark

For sample benchmarking, refer to the [webpack cycle detection benchmark script](./benchmarks/webpack/find-cycles.js).

`Apple M1 Max`

```bash
----------------------------------------
Started webpack benchmark with cycle detection = INFINITY (Johnson)
Has cycles:  true
Cycles found:  127988
Duration (seconds):  9.665837625
Duplicates:  0
Unique cycles:  127988
Longest cycle:  33
----------------------------------------
Started webpack benchmark with cycle detection = INFINITY (DFS)
Has cycles:  true
Cycles found:  164
Duration (seconds):  0.0016959590000005847
Duplicates:  0
Unique cycles:  164
Longest cycle:  16
----------------------------------------
Started webpack benchmark with cycle detection = 500
Has cycles:  true
Cycles found:  164
Duration (seconds):  0.0010632080000013958
Duplicates:  0
Unique cycles:  164
Longest cycle:  16
----------------------------------------
Started webpack benchmark with cycle detection = 100
Has cycles:  true
Cycles found:  164
Duration (seconds):  0.0011481669999993756
Duplicates:  0
Unique cycles:  164
Longest cycle:  16
----------------------------------------
Started webpack benchmark with cycle detection = 20
Has cycles:  true
Cycles found:  164
Duration (seconds):  0.001005582999998296
Duplicates:  0
Unique cycles:  164
Longest cycle:  16
----------------------------------------
Started webpack benchmark with cycle detection = 10
Has cycles:  true
Cycles found:  143
Duration (seconds):  0.0009575420000001031
Duplicates:  0
Unique cycles:  143
Longest cycle:  7
```
