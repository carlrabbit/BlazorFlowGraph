using BlazorFlowGraph.Protocol;

namespace LargeGraphStress;

/// <summary>
/// Generates synthetic graphs for stress testing and performance validation.
/// </summary>
public static class SyntheticGraphGenerator
{
    /// <summary>
    /// Generates a graph with the specified number of nodes and edge density.
    /// </summary>
    /// <param name="nodes">Number of nodes.</param>
    /// <param name="edgeDensity">
    /// Fraction of possible edges to create (0.0–1.0).
    /// An <paramref name="edgeDensity"/> of 0.1 creates ~10% of possible edges.
    /// </param>
    /// <param name="version">Snapshot version number.</param>
    /// <param name="seed">Random seed for reproducibility.</param>
    public static GraphSnapshot GenerateGraph(
        int nodes,
        double edgeDensity = 0.1,
        int version = 0,
        int? seed = null)
    {
        nodes = Math.Max(nodes, 0);
        edgeDensity = Math.Clamp(edgeDensity, 0d, 1d);

        if (nodes == 0)
            return new GraphSnapshot(version, [], []);

        var random = seed.HasValue ? new Random(seed.Value) : new Random();
        string[] kinds = ["default", "service", "datastore", "gateway", "queue"];

        var nodeList = Enumerable.Range(0, nodes)
            .Select(i => new GraphNode(
                new NodeId($"node-{i}"),
                $"Node {i}",
                kinds[i % kinds.Length]))
            .ToList();

        var edgeList = new List<GraphEdge>();
        var maxEdges = (long)nodes * (nodes - 1);
        var targetEdges = (int)(maxEdges * edgeDensity);

        var seen = new HashSet<(int, int)>();
        var attempts = 0;
        var maxAttempts = targetEdges * 10;

        while (edgeList.Count < targetEdges && attempts < maxAttempts)
        {
            attempts++;
            var src = random.Next(nodes);
            var tgt = random.Next(nodes);

            if (src == tgt || !seen.Add((src, tgt)))
                continue;

            edgeList.Add(new GraphEdge(
                new EdgeId($"edge-{src}-{tgt}"),
                new NodeId($"node-{src}"),
                new NodeId($"node-{tgt}")));
        }

        return new GraphSnapshot(version, nodeList, edgeList);
    }
}
