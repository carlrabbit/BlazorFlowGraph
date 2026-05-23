namespace BlazorFlowGraph.Protocol;

/// <summary>Unique identifier for a graph node.</summary>
public readonly record struct NodeId(string Value)
{
    public override string ToString()
    {
        return Value;
    }
}

/// <summary>Unique identifier for a graph edge.</summary>
public readonly record struct EdgeId(string Value)
{
    public override string ToString()
    {
        return Value;
    }
}

/// <summary>A node in the dataflow graph.</summary>
public sealed record GraphNode(
    NodeId Id,
    string Label,
    string Kind,
    IReadOnlyDictionary<string, object>? Metadata = null);

/// <summary>A directed edge between two nodes.</summary>
public sealed record GraphEdge(
    EdgeId Id,
    NodeId SourceId,
    NodeId TargetId,
    string? Label = null);

/// <summary>Unique identifier for a graph group.</summary>
public readonly record struct GroupId(string Value)
{
    public override string ToString()
    {
        return Value;
    }
}

/// <summary>A semantic group that aggregates child nodes.</summary>
public sealed record GraphGroup(
    GroupId Id,
    string Label,
    string Kind,
    IReadOnlyList<NodeId> ChildNodeIds,
    IReadOnlyDictionary<string, object>? Metadata = null);

/// <summary>A complete snapshot of the graph at a given version.</summary>
public sealed record GraphSnapshot(
    int Version,
    IReadOnlyList<GraphNode> Nodes,
    IReadOnlyList<GraphEdge> Edges,
    IReadOnlyList<GraphGroup>? Groups = null,
    int ProtocolVersion = 1);

/// <summary>The type of a diff operation.</summary>
public enum DiffOperationType
{
    Add,
    Remove,
    Update,
}

/// <summary>A diff operation on a node.</summary>
public sealed record NodeDiffOperation(DiffOperationType Type, GraphNode Node);

/// <summary>A diff operation on an edge.</summary>
public sealed record EdgeDiffOperation(DiffOperationType Type, GraphEdge Edge);

/// <summary>A diff operation on a group.</summary>
public sealed record GroupDiffOperation(DiffOperationType Type, GraphGroup Group);

/// <summary>An incremental diff between two graph versions.</summary>
public sealed record GraphDiff(
    int ProtocolVersion,
    int FromVersion,
    int ToVersion,
    IReadOnlyList<NodeDiffOperation> NodeOperations,
    IReadOnlyList<EdgeDiffOperation> EdgeOperations,
    IReadOnlyList<GroupDiffOperation>? GroupOperations = null)
{
    public GraphDiff(int FromVersion, int ToVersion, IReadOnlyList<NodeDiffOperation> NodeOperations, IReadOnlyList<EdgeDiffOperation> EdgeOperations, IReadOnlyList<GroupDiffOperation>? GroupOperations = null)
        : this(1, FromVersion, ToVersion, NodeOperations, EdgeOperations, GroupOperations)
    {
    }
}

/// <summary>A semantic overlay on a node.</summary>
public sealed record NodeOverlay(NodeId NodeId, string Kind, IReadOnlyDictionary<string, object>? Data = null);

/// <summary>A semantic overlay on an edge.</summary>
public sealed record EdgeOverlay(EdgeId EdgeId, string Kind, IReadOnlyDictionary<string, object>? Data = null);
