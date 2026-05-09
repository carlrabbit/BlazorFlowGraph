namespace Diagram.Semantics;

/// <summary>
/// Marker attribute for types that participate in the semantic graph.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface, Inherited = true)]
public sealed class SemanticNodeAttribute : Attribute
{
    /// <summary>Optional display label override.</summary>
    public string? Label { get; init; }

    /// <summary>The semantic kind of this node.</summary>
    public string Kind { get; init; } = "default";
}

/// <summary>
/// Marker attribute for properties or fields that represent edges.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class SemanticEdgeAttribute : Attribute
{
    /// <summary>Optional edge label.</summary>
    public string? Label { get; init; }
}

/// <summary>
/// Marker attribute for types that act as group containers aggregating semantic nodes.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface, Inherited = true)]
public sealed class SemanticGroupAttribute : Attribute
{
    /// <summary>Optional display label override.</summary>
    public string? Label { get; init; }

    /// <summary>The semantic kind of this group.</summary>
    public string Kind { get; init; } = "default";
}
