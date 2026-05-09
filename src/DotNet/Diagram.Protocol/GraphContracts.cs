namespace Diagram.Protocol;

/// <summary>Unique identifier for a graph node.</summary>
public readonly record struct NodeId(string Value)
{
    public override string ToString() => Value;
}

/// <summary>Unique identifier for a graph edge.</summary>
public readonly record struct EdgeId(string Value)
{
    public override string ToString() => Value;
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

/// <summary>A complete snapshot of the graph at a given version.</summary>
public sealed record GraphSnapshot(
    int Version,
    IReadOnlyList<GraphNode> Nodes,
    IReadOnlyList<GraphEdge> Edges);

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

/// <summary>An incremental diff between two graph versions.</summary>
public sealed record GraphDiff(
    int FromVersion,
    int ToVersion,
    IReadOnlyList<NodeDiffOperation> NodeOperations,
    IReadOnlyList<EdgeDiffOperation> EdgeOperations);
