import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { CyclesDFS, CyclesJohnson, DiGraph } from 'ya-digraph-js';

const data = await readFile(path.join(process.cwd(), './webpack.json'), 'utf-8');
const graph = new DiGraph();
// add vertices to the graph
for (const [nodeId] of Object.entries(JSON.parse(data))) {
	graph.addVertices({ id: nodeId });
}
console.log('Vertices added: ', Array.from(graph.getVertexIds()).length);
// add edges to the graph
for (const [nodeId, nodeValue] of Object.entries(JSON.parse(data))) {
	const typedNodeValue = nodeValue as { adjacentTo: string[] }; // Explicitly type nodeValue
	for (const from of typedNodeValue.adjacentTo) {
		graph.addEdges({ from: nodeId, to: from });
	}
}
console.log('Edges added: ', Array.from(graph.getEdgeIds()).length);

{
	console.log('----------------------------------------');
	const start = performance.now();
	console.log('Started webpack benchmark with cycle detection = INFINITY (Johnson)');
	const cyclesSearch = new CyclesJohnson(graph);
	console.log('Has cycles: ', cyclesSearch.hasCycles());
	const cycles = [...cyclesSearch.findCycles()];
	const end = performance.now() - start;
	console.log('Cycles found: ', cycles.length);
	console.log('Duration (seconds): ', end / 1000);

	// find if there are any duplicates
	const duplicates: string[][] = [];
	const uniqueCycles: string[][] = [];
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
	const start = performance.now();
	console.log('Started webpack benchmark with cycle detection = INFINITY (DFS)');
	const cyclesSearch = new CyclesDFS(graph);
	console.log('Has cycles: ', cyclesSearch.hasCycles());
	const cycles = [...cyclesSearch.findCycles()];
	const end = performance.now() - start;
	console.log('Cycles found: ', cycles.length);
	console.log('Duration (seconds): ', end / 1000);

	// find if there are any duplicates
	const duplicates: string[][] = [];
	const uniqueCycles: string[][] = [];
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
	const start = performance.now();
	console.log('Started webpack benchmark with cycle detection = 500');
	const cyclesSearch = new CyclesDFS(graph);
	console.log('Has cycles: ', cyclesSearch.hasCycles(500));
	const cycles = [...cyclesSearch.findCycles(500)];
	const end = performance.now() - start;
	console.log('Cycles found: ', cycles.length);
	console.log('Duration (seconds): ', end / 1000);

	// find if there are any duplicates
	const duplicates: string[][] = [];
	const uniqueCycles: string[][] = [];
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
	const start = performance.now();
	console.log('Started webpack benchmark with cycle detection = 100');
	const cyclesSearch = new CyclesDFS(graph);
	console.log('Has cycles: ', cyclesSearch.hasCycles(100));
	const cycles = [...cyclesSearch.findCycles(100)];
	const end = performance.now() - start;
	console.log('Cycles found: ', cycles.length);
	console.log('Duration (seconds): ', end / 1000);

	// find if there are any duplicates
	const duplicates: string[][] = [];
	const uniqueCycles: string[][] = [];
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
	const start = performance.now();
	console.log('Started webpack benchmark with cycle detection = 20');
	const cyclesSearch = new CyclesDFS(graph);
	console.log('Has cycles: ', cyclesSearch.hasCycles(20));
	const cycles = [...cyclesSearch.findCycles(20)];
	const end = performance.now() - start;
	console.log('Cycles found: ', cycles.length);
	console.log('Duration (seconds): ', end / 1000);

	// find if there are any duplicates
	const duplicates: string[][] = [];
	const uniqueCycles: string[][] = [];
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
	const start = performance.now();
	console.log('Started webpack benchmark with cycle detection = 10');
	const cyclesSearch = new CyclesDFS(graph);
	console.log('Has cycles: ', cyclesSearch.hasCycles(10));
	const cycles = [...cyclesSearch.findCycles(10)];
	const end = performance.now() - start;
	console.log('Cycles found: ', cycles.length);
	console.log('Duration (seconds): ', end / 1000);

	// find if there are any duplicates
	const duplicates: string[][] = [];
	const uniqueCycles: string[][] = [];
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
