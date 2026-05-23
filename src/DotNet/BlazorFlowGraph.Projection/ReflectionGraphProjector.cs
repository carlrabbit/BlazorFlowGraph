using System.Globalization;
using System.Reflection;
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
/// reflection to discover <see cref="SemanticNodeAttribute"/> annotations.
/// </summary>
public sealed class ReflectionGraphProjector : IGraphProjector
{
    /// <inheritdoc />
    public GraphSnapshot Project(IEnumerable<object> semanticObjects, int version = 0)
    {
        var nodes = new List<GraphNode>();
        var edges = new List<GraphEdge>();
        var groups = new List<GraphGroup>();

        IList<object> objectList = semanticObjects as IList<object> ?? [.. semanticObjects];

        // Build a stable id lookup so group membership can reference node ids.
        var objectIds = new Dictionary<object, NodeId>(ReferenceEqualityComparer.Instance);

        foreach (var obj in objectList)
        {
            Type type = obj.GetType();
            SemanticNodeAttribute? nodeAttr = type.GetCustomAttributes(typeof(SemanticNodeAttribute), inherit: true)
                               .OfType<SemanticNodeAttribute>()
                               .FirstOrDefault();

            if (nodeAttr is null)
            {
                continue;
            }

            var nodeId = new NodeId(RuntimeHelpers.GetHashCode(obj).ToString("x8", CultureInfo.InvariantCulture));
            objectIds[obj] = nodeId;
            var label = nodeAttr.Label ?? type.Name;
            nodes.Add(new GraphNode(nodeId, label, nodeAttr.Kind));

            foreach (PropertyInfo prop in type.GetProperties())
            {
                SemanticEdgeAttribute? edgeAttr = prop.GetCustomAttributes(typeof(SemanticEdgeAttribute), inherit: true)
                                   .OfType<SemanticEdgeAttribute>()
                                   .FirstOrDefault();

                if (edgeAttr is null)
                {
                    continue;
                }

                var target = prop.GetValue(obj);
                if (target is null)
                {
                    continue;
                }

                var targetId = new NodeId(RuntimeHelpers.GetHashCode(target).ToString("x8", CultureInfo.InvariantCulture));
                var edgeId = new EdgeId($"{nodeId.Value}->{targetId.Value}");
                edges.Add(new GraphEdge(edgeId, nodeId, targetId, edgeAttr.Label));
            }
        }

        foreach (var obj in objectList)
        {
            Type type = obj.GetType();
            SemanticGroupAttribute? groupAttr = type.GetCustomAttributes(typeof(SemanticGroupAttribute), inherit: true)
                                .OfType<SemanticGroupAttribute>()
                                .FirstOrDefault();

            if (groupAttr is null)
            {
                continue;
            }

            var childIds = new List<NodeId>();
            foreach (PropertyInfo prop in type.GetProperties())
            {
                var value = prop.GetValue(obj);
                if (value is null)
                {
                    continue;
                }

                if (objectIds.TryGetValue(value, out NodeId childId))
                {
                    childIds.Add(childId);
                    continue;
                }

                // Support collection properties containing annotated nodes.
                if (value is System.Collections.IEnumerable enumerable)
                {
                    foreach (var item in enumerable)
                    {
                        if (item is not null && objectIds.TryGetValue(item, out NodeId itemId))
                        {
                            childIds.Add(itemId);
                        }
                    }
                }
            }

            var groupId = new GroupId(RuntimeHelpers.GetHashCode(obj).ToString("x8", CultureInfo.InvariantCulture));
            var label = groupAttr.Label ?? type.Name;
            groups.Add(new GraphGroup(groupId, label, groupAttr.Kind, childIds));
        }

        return new GraphSnapshot(version, nodes, edges, groups.Count > 0 ? groups : null);
    }
}
