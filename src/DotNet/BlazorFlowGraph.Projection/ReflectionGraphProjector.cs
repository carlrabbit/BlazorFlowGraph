using BlazorFlowGraph.Protocol;
using BlazorFlowGraph.Semantics;

namespace BlazorFlowGraph.Projection;

/// <summary>
/// Projects a semantic model into a <see cref="GraphSnapshot"/>.
/// </summary>
public interface IGraphProjector
{
    /// <summary>
    /// Produces a graph snapshot from the provided semantic objects.
    /// </summary>
    GraphSnapshot Project(IEnumerable<object> semanticObjects, int version = 0);
}

/// <summary>
/// Default implementation of <see cref="IGraphProjector"/> that uses
/// reflection to discover semantic configuration records and legacy semantic attributes.
/// </summary>
public sealed class ReflectionGraphProjector : IGraphProjector
{
    /// <inheritdoc />
    public GraphSnapshot Project(IEnumerable<object> semanticObjects, int version = 0)
    {
        var nodes = new List<GraphNode>();
        var edges = new List<GraphEdge>();
        var groups = new List<GraphGroup>();

        var objectList = semanticObjects as IList<object> ?? semanticObjects.ToList();

        // Build a stable id lookup so group membership can reference node ids.
        var objectIds = new Dictionary<object, NodeId>(ReferenceEqualityComparer.Instance);

        foreach (var obj in objectList)
        {
            var type = obj.GetType();
            var config = GetSemanticConfiguration(type, obj);
            var nodeConfig = ResolveNodeDefinition(type, config);

            if (nodeConfig is null)
                continue;

            var nodeId = new NodeId(RuntimeHelpers.GetHashCode(obj).ToString("x8"));
            objectIds[obj] = nodeId;
            var label = nodeConfig.Label ?? type.Name;
            nodes.Add(new GraphNode(nodeId, label, nodeConfig.Kind, nodeConfig.Metadata));

            foreach (var edgeConfig in ResolveEdgeDefinitions(type, config))
            {
                if (!TryGetMemberValue(type, obj, edgeConfig.TargetMember, out var target))
                    continue;

                if (target is null)
                    continue;

                var targetId = new NodeId(RuntimeHelpers.GetHashCode(target).ToString("x8"));
                var edgeId = new EdgeId($"{nodeId.Value}->{targetId.Value}");
                edges.Add(new GraphEdge(edgeId, nodeId, targetId, edgeConfig.Label));
            }
        }

        foreach (var obj in objectList)
        {
            var type = obj.GetType();
            var config = GetSemanticConfiguration(type, obj);
            var groupConfig = ResolveGroupDefinition(type, config);

            if (groupConfig is null)
                continue;

            var childIds = new List<NodeId>();
            var childMembers = groupConfig.ChildMembers ?? type.GetProperties().Select(static property => property.Name).ToArray();
            foreach (var childMember in childMembers)
            {
                if (!TryGetMemberValue(type, obj, childMember, out var value))
                    continue;

                if (value is null)
                    continue;

                if (objectIds.TryGetValue(value, out var childId))
                {
                    childIds.Add(childId);
                    continue;
                }

                // Support collection properties containing annotated nodes.
                if (value is System.Collections.IEnumerable enumerable)
                {
                    foreach (var item in enumerable)
                    {
                        if (item is not null && objectIds.TryGetValue(item, out var itemId))
                            childIds.Add(itemId);
                    }
                }
            }

            var groupId = new GroupId(RuntimeHelpers.GetHashCode(obj).ToString("x8"));
            var label = groupConfig.Label ?? type.Name;
            groups.Add(new GraphGroup(groupId, label, groupConfig.Kind, childIds, groupConfig.Metadata));
        }

        return new GraphSnapshot(version, nodes, edges, groups.Count > 0 ? groups : null);
    }

    private static SemanticConfiguration? GetSemanticConfiguration(Type type, object obj)
        => type.GetProperties()
               .Where(static property => property.CanRead && property.GetIndexParameters().Length == 0)
               .FirstOrDefault(static property => typeof(SemanticConfiguration).IsAssignableFrom(property.PropertyType))
               ?.GetValue(obj) as SemanticConfiguration;

    private static SemanticNodeDefinition? ResolveNodeDefinition(Type type, SemanticConfiguration? config)
    {
        if (config?.Node is not null)
            return config.Node;

        var nodeAttr = type.GetCustomAttributes(typeof(SemanticNodeAttribute), inherit: true)
                           .OfType<SemanticNodeAttribute>()
                           .FirstOrDefault();

        return nodeAttr is null
            ? null
            : new SemanticNodeDefinition(nodeAttr.Label, nodeAttr.Kind);
    }

    private static IReadOnlyList<SemanticEdgeDefinition> ResolveEdgeDefinitions(Type type, SemanticConfiguration? config)
    {
        if (config?.Edges is not null)
            return config.Edges;

        return type.GetProperties()
                   .Select(static property => new
                   {
                       Property = property,
                       Attribute = property.GetCustomAttributes(typeof(SemanticEdgeAttribute), inherit: true)
                                           .OfType<SemanticEdgeAttribute>()
                                           .FirstOrDefault()
                   })
                   .Where(static entry => entry.Attribute is not null)
                   .Select(static entry => new SemanticEdgeDefinition(entry.Property.Name, entry.Attribute!.Label))
                   .ToArray();
    }

    private static SemanticGroupDefinition? ResolveGroupDefinition(Type type, SemanticConfiguration? config)
    {
        if (config?.Group is not null)
            return config.Group;

        var groupAttr = type.GetCustomAttributes(typeof(SemanticGroupAttribute), inherit: true)
                            .OfType<SemanticGroupAttribute>()
                            .FirstOrDefault();

        return groupAttr is null
            ? null
            : new SemanticGroupDefinition(groupAttr.Label, groupAttr.Kind);
    }

    private static bool TryGetMemberValue(Type type, object obj, string memberName, out object? value)
    {
        var property = type.GetProperty(memberName);
        if (property is not null)
        {
            value = property.GetValue(obj);
            return true;
        }

        var field = type.GetField(memberName);
        if (field is not null)
        {
            value = field.GetValue(obj);
            return true;
        }

        value = null;
        return false;
    }
}
