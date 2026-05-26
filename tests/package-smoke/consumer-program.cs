using BlazorFlowGraph.Blazor;
using BlazorFlowGraph.Protocol;

var snapshot = new GraphSnapshot(
    Version: 1,
    Nodes: new[] { new GraphNode(new NodeId("node-1"), "Node 1", "task") },
    Edges: Array.Empty<GraphEdge>());

Console.WriteLine($"Smoke check type: {typeof(DataflowGraph).FullName}");
Console.WriteLine($"Smoke check snapshot version: {snapshot.Version}");
