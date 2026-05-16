using BlazorFlowGraph.Protocol;

namespace BlazorFlowGraph.Diffing;

/// <summary>
/// Computes incremental diffs between two graph snapshots.
/// </summary>
public interface IGraphDiffer
{
    /// <summary>
    /// Computes the diff between <paramref name="from"/> and <paramref name="to"/>.
    /// </summary>
    GraphDiff Diff(GraphSnapshot from, GraphSnapshot to);
}

/// <summary>
/// Default implementation of <see cref="IGraphDiffer"/>.
/// </summary>
public sealed class GraphDiffer : IGraphDiffer
{
    /// <inheritdoc />
    public GraphDiff Diff(GraphSnapshot from, GraphSnapshot to)
    {
        var nodeOps = new List<NodeDiffOperation>();
        var edgeOps = new List<EdgeDiffOperation>();

        var fromNodes = from.Nodes.ToDictionary(n => n.Id);
        var toNodes = to.Nodes.ToDictionary(n => n.Id);

        foreach (var (id, node) in toNodes)
        {
            if (!fromNodes.TryGetValue(id, out var existing))
                nodeOps.Add(new NodeDiffOperation(DiffOperationType.Add, node));
            else if (existing != node)
                nodeOps.Add(new NodeDiffOperation(DiffOperationType.Update, node));
        }

        foreach (var (id, node) in fromNodes)
        {
            if (!toNodes.ContainsKey(id))
                nodeOps.Add(new NodeDiffOperation(DiffOperationType.Remove, node));
        }

        var fromEdges = from.Edges.ToDictionary(e => e.Id);
        var toEdges = to.Edges.ToDictionary(e => e.Id);

        foreach (var (id, edge) in toEdges)
        {
            if (!fromEdges.TryGetValue(id, out var existing))
                edgeOps.Add(new EdgeDiffOperation(DiffOperationType.Add, edge));
            else if (existing != edge)
                edgeOps.Add(new EdgeDiffOperation(DiffOperationType.Update, edge));
        }

        foreach (var (id, edge) in fromEdges)
        {
            if (!toEdges.ContainsKey(id))
                edgeOps.Add(new EdgeDiffOperation(DiffOperationType.Remove, edge));
        }

        List<GroupDiffOperation>? groupOps = null;

        if (from.Groups is not null || to.Groups is not null)
        {
            groupOps = new List<GroupDiffOperation>();
            var fromGroups = (from.Groups ?? []).ToDictionary(g => g.Id);
            var toGroups = (to.Groups ?? []).ToDictionary(g => g.Id);

            foreach (var (id, group) in toGroups)
            {
                if (!fromGroups.TryGetValue(id, out var existing))
                    groupOps.Add(new GroupDiffOperation(DiffOperationType.Add, group));
                else if (existing != group)
                    groupOps.Add(new GroupDiffOperation(DiffOperationType.Update, group));
            }

            foreach (var (id, group) in fromGroups)
            {
                if (!toGroups.ContainsKey(id))
                    groupOps.Add(new GroupDiffOperation(DiffOperationType.Remove, group));
            }
        }

        return new GraphDiff(to.ProtocolVersion, from.Version, to.Version, nodeOps, edgeOps, groupOps);
    }
}
