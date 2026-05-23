using BlazorFlowGraph.Protocol;

namespace BlazorFlowGraph.Diffing;

/// <summary>
/// Computes incremental diffs between two graph snapshots.
/// </summary>
public interface IGraphDiffer
{
    /// <summary>
    /// Computes the diff between <paramref name="from"/> and <paramref name="target"/>.
    /// </summary>
    GraphDiff Diff(GraphSnapshot from, GraphSnapshot target);
}

/// <summary>
/// Default implementation of <see cref="IGraphDiffer"/>.
/// </summary>
public sealed class GraphDiffer : IGraphDiffer
{
    /// <inheritdoc />
    public GraphDiff Diff(GraphSnapshot from, GraphSnapshot target)
    {
        var nodeOps = new List<NodeDiffOperation>();
        var edgeOps = new List<EdgeDiffOperation>();

        var fromNodes = from.Nodes.ToDictionary(n => n.Id);
        var toNodes = target.Nodes.ToDictionary(n => n.Id);

        foreach ((NodeId id, GraphNode? node) in toNodes)
        {
            if (!fromNodes.TryGetValue(id, out GraphNode? existing))
            {
                nodeOps.Add(new NodeDiffOperation(DiffOperationType.Add, node));
            }
            else if (existing != node)
            {
                nodeOps.Add(new NodeDiffOperation(DiffOperationType.Update, node));
            }
        }

        foreach ((NodeId id, GraphNode? node) in fromNodes)
        {
            if (!toNodes.ContainsKey(id))
            {
                nodeOps.Add(new NodeDiffOperation(DiffOperationType.Remove, node));
            }
        }

        var fromEdges = from.Edges.ToDictionary(e => e.Id);
        var toEdges = target.Edges.ToDictionary(e => e.Id);

        foreach ((EdgeId id, GraphEdge? edge) in toEdges)
        {
            if (!fromEdges.TryGetValue(id, out GraphEdge? existing))
            {
                edgeOps.Add(new EdgeDiffOperation(DiffOperationType.Add, edge));
            }
            else if (existing != edge)
            {
                edgeOps.Add(new EdgeDiffOperation(DiffOperationType.Update, edge));
            }
        }

        foreach ((EdgeId id, GraphEdge? edge) in fromEdges)
        {
            if (!toEdges.ContainsKey(id))
            {
                edgeOps.Add(new EdgeDiffOperation(DiffOperationType.Remove, edge));
            }
        }

        List<GroupDiffOperation>? groupOps = null;

        if (from.Groups is not null || target.Groups is not null)
        {
            groupOps = [];
            var fromGroups = (from.Groups ?? []).ToDictionary(g => g.Id);
            var toGroups = (target.Groups ?? []).ToDictionary(g => g.Id);

            foreach ((GroupId id, GraphGroup? group) in toGroups)
            {
                if (!fromGroups.TryGetValue(id, out GraphGroup? existing))
                {
                    groupOps.Add(new GroupDiffOperation(DiffOperationType.Add, group));
                }
                else if (existing != group)
                {
                    groupOps.Add(new GroupDiffOperation(DiffOperationType.Update, group));
                }
            }

            foreach ((GroupId id, GraphGroup? group) in fromGroups)
            {
                if (!toGroups.ContainsKey(id))
                {
                    groupOps.Add(new GroupDiffOperation(DiffOperationType.Remove, group));
                }
            }
        }

        return new GraphDiff(target.ProtocolVersion, from.Version, target.Version, nodeOps, edgeOps, groupOps);
    }
}
