import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { CyclesDFS, CyclesJohnson, DiGraph } from '../../dist/index.js';
/** @type {import('../../distindex').DiGraph} */
/** @type {import('../../dist/index').CyclesJohnson} */
/** @type {import('../../dist/index').CyclesDFS} */

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
  console.log('Started webpack benchmark with cycle detection = INFINITY (Johnson)');
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
  // Longest cycle
  const longestCycle = uniqueCycles.reduce((a, b) => (a.length > b.length ? a : b), []);
  console.log('Longest cycle: ', longestCycle.length);
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
  console.log('Started webpack benchmark with cycle detection = INFINITY (DFS)');
  const cyclesSearch = new CyclesDFS(graph);
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
  // Longest cycle
  const longestCycle = uniqueCycles.reduce((a, b) => (a.length > b.length ? a : b), []);
  console.log('Longest cycle: ', longestCycle.length);
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
  const cyclesSearch = new CyclesDFS(graph);
  const cycles = [...cyclesSearch.findCycles(500)];
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
  // Longest cycle
  const longestCycle = uniqueCycles.reduce((a, b) => (a.length > b.length ? a : b), []);
  console.log('Longest cycle: ', longestCycle.length);
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
  console.log('Started webpack benchmark with cycle detection = 100');
  const cyclesSearch = new CyclesDFS(graph);
  const cycles = [...cyclesSearch.findCycles(100)];
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
  // Longest cycle
  const longestCycle = uniqueCycles.reduce((a, b) => (a.length > b.length ? a : b), []);
  console.log('Longest cycle: ', longestCycle.length);
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
  console.log('Started webpack benchmark with cycle detection = 20');
  const cyclesSearch = new CyclesDFS(graph);
  const cycles = [...cyclesSearch.findCycles(20)];
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
  // Longest cycle
  const longestCycle = uniqueCycles.reduce((a, b) => (a.length > b.length ? a : b), []);
  console.log('Longest cycle: ', longestCycle.length);
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
  console.log('Started webpack benchmark with cycle detection = 10');
  const cyclesSearch = new CyclesDFS(graph);
  const cycles = [...cyclesSearch.findCycles(10)];
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
  // Longest cycle
  const longestCycle = uniqueCycles.reduce((a, b) => (a.length > b.length ? a : b), []);
  console.log('Longest cycle: ', longestCycle.length);
}
