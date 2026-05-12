using System.Linq.Expressions;
using System.Reflection;

namespace BlazorFlowGraph.Semantics;

/// <summary>
/// Property-based semantic configuration for a domain model object.
/// </summary>
public sealed record SemanticConfiguration(
    SemanticNodeDefinition? Node = null,
    IReadOnlyList<SemanticEdgeDefinition>? Edges = null,
    SemanticGroupDefinition? Group = null);

/// <summary>
/// Describes how a domain object should be projected as a graph node.
/// </summary>
public sealed record SemanticNodeDefinition(
    string? Label = null,
    string Kind = "default",
    IReadOnlyDictionary<string, object>? Metadata = null);

/// <summary>
/// Describes how a domain object property or field should be projected as a graph edge.
/// </summary>
public sealed record SemanticEdgeDefinition(
    string TargetMember,
    string? Label = null)
{
    /// <summary>
    /// Creates an edge definition from a strongly typed member expression.
    /// </summary>
    public static SemanticEdgeDefinition Create<T>(Expression<Func<T, object?>> targetMember)
        => new(MemberNameResolver.GetName(targetMember));

    /// <summary>
    /// Creates an edge definition from a strongly typed member expression.
    /// </summary>
    public static SemanticEdgeDefinition Create<T>(Expression<Func<T, object?>> targetMember, string? label)
        => new(MemberNameResolver.GetName(targetMember), label);
}

/// <summary>
/// Describes how a domain object should be projected as a graph group.
/// </summary>
public sealed record SemanticGroupDefinition(
    string? Label = null,
    string Kind = "default",
    IReadOnlyList<string>? ChildMembers = null,
    IReadOnlyDictionary<string, object>? Metadata = null)
{
    /// <summary>
    /// Creates a group definition with strongly typed child member expressions.
    /// </summary>
    public static SemanticGroupDefinition Create<T>(
        string? label = null,
        string kind = "default",
        params Expression<Func<T, object?>>[] childMembers)
        => new(
            label,
            kind,
            childMembers.Select(MemberNameResolver.GetName).ToArray());
}

internal static class MemberNameResolver
{
    public static string GetName(LambdaExpression expression)
    {
        var body = expression.Body;
        if (body is UnaryExpression
            {
                NodeType: ExpressionType.Convert or ExpressionType.ConvertChecked,
                Operand: var operand
            })
        {
            body = operand;
        }

        if (body is MemberExpression { Member: PropertyInfo or FieldInfo } memberExpression)
            return memberExpression.Member.Name;

        throw new ArgumentException("Expression must target a property or field member.", nameof(expression));
    }
}
