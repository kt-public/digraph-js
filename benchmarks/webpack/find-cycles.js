import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { CyclesJohnson, CyclesSimple, DiGraph } from '../../dist/cjs/index.js';
/** @type {import('../../dist/cjs/index').DiGraph} */
/** @type {import('../../dist/cjs/index').CyclesJohnson} */
/** @type {import('../../dist/cjs/index').CyclesSimple} */

{
  console.log('----------------------------------------');
  const data = await readFile(path.join(process.cwd(), './webpack.json'));
  const graph = new DiGraph();
  // add vertices to the graph
  for (const [nodeId] of Object.entries(JSON.parse(data))) {
    graph.addVertices({ id: nodeId });
  }
  // add edges to the graph
  for (const [nodeId, nodeValue] of Object.entries(JSON.parse(data))) {
    for (const from of nodeValue.adjacentTo) {
      graph.addEdges({ from: nodeId, to: from });
    }
  }

  const start = performance.now();
  console.log('Started webpack benchmark with cycle detection = INFINITY');
  const cyclesSearch = new CyclesJohnson(graph);
  const cycles = [...cyclesSearch.findCycles()];
  const end = performance.now() - start;
  console.log(`${cycles.length} cycles found`);
  console.log(`Took ${(end / 1000).toFixed(3)} seconds to find cycles on Webpack`);
  // find if there are any duplicates
  const duplicates = [];
  const uniqueCycles = [];
  const uniqueCyclesSet = new Set();
  for (const cycle of cycles) {
    const cycleString = [...cycle].sort().join(',');
    if (uniqueCyclesSet.has(cycleString)) {
      duplicates.push(cycle);
    } else {
      uniqueCyclesSet.add(cycleString);
      uniqueCycles.push(cycle);
    }
  }
  console.log('Duplicates: ', duplicates.length);
  // print all cycles
  console.log('Unique cycles: ', uniqueCycles.length);
}

{
  console.log('----------------------------------------');
  const data = await readFile(path.join(process.cwd(), './webpack.json'));
  const graph = new DiGraph();
  // add vertices to the graph
  for (const [nodeId] of Object.entries(JSON.parse(data))) {
    graph.addVertices({ id: nodeId });
  }
  // add edges to the graph
  for (const [nodeId, nodeValue] of Object.entries(JSON.parse(data))) {
    for (const from of nodeValue.adjacentTo) {
      graph.addEdges({ from: nodeId, to: from });
    }
  }

  const start = performance.now();
  console.log('Started webpack benchmark with cycle detection = 500');
  const cyclesSearch = new CyclesSimple(graph);
  const cycles = [...cyclesSearch.findCycles(500)];
  const end = performance.now() - start;
  console.log(`${cycles.length} cycles found`);
  console.log(`Took ${(end / 1000).toFixed(3)} seconds to find cycles on Webpack`);
}

{
  console.log('----------------------------------------');
  const data = await readFile(path.join(process.cwd(), './webpack.json'));
  const graph = new DiGraph();
  for (const [nodeId, nodeValue] of Object.entries(JSON.parse(data))) {
    graph.addVertex({ id: nodeId, adjacentTo: nodeValue.adjacentTo });
  }
  const start = performance.now();
  console.log('Started webpack benchmark with cycle detection = 100');
  const cycles = graph.findCycles({ maxDepth: 100 });
  const end = performance.now() - start;
  console.log(`${cycles.length} cycles found`);
  console.log(`Took ${(end / 1000).toFixed(3)} seconds to find cycles on Webpack`);
}

{
  console.log('----------------------------------------');
  const data = await readFile(path.join(process.cwd(), './webpack.json'));
  const graph = new DiGraph();
  for (const [nodeId, nodeValue] of Object.entries(JSON.parse(data))) {
    graph.addVertex({ id: nodeId, adjacentTo: nodeValue.adjacentTo });
  }
  const start = performance.now();
  console.log('Started webpack benchmark with cycle detection = 20');
  const cycles = graph.findCycles({ maxDepth: 20 });
  const end = performance.now() - start;
  console.log(`${cycles.length} cycles found`);
  console.log(`Took ${(end / 1000).toFixed(3)} seconds to find cycles on Webpack`);
}
