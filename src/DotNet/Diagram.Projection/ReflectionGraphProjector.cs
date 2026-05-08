using Diagram.Protocol;
using Diagram.Semantics;

namespace Diagram.Projection;

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

        foreach (var obj in semanticObjects)
        {
            var type = obj.GetType();
            var nodeAttr = type.GetCustomAttributes(typeof(SemanticNodeAttribute), inherit: true)
                               .OfType<SemanticNodeAttribute>()
                               .FirstOrDefault();

            if (nodeAttr is null)
                continue;

            var nodeId = new NodeId(RuntimeHelpers.GetHashCode(obj).ToString("x8"));
            var label = nodeAttr.Label ?? type.Name;
            nodes.Add(new GraphNode(nodeId, label, nodeAttr.Kind));

            foreach (var prop in type.GetProperties())
            {
                var edgeAttr = prop.GetCustomAttributes(typeof(SemanticEdgeAttribute), inherit: true)
                                   .OfType<SemanticEdgeAttribute>()
                                   .FirstOrDefault();

                if (edgeAttr is null)
                    continue;

                var target = prop.GetValue(obj);
                if (target is null)
                    continue;

                var targetId = new NodeId(RuntimeHelpers.GetHashCode(target).ToString("x8"));
                var edgeId = new EdgeId($"{nodeId.Value}->{targetId.Value}");
                edges.Add(new GraphEdge(edgeId, nodeId, targetId, edgeAttr.Label));
            }
        }

        return new GraphSnapshot(version, nodes, edges);
    }
}
