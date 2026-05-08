using Diagram.Protocol;

namespace Diagram.Protocol.Tests;

public class GraphContractsTests
{
    [Fact]
    public void GraphNode_Equality_BasedOnValues()
    {
        var a = new GraphNode(new NodeId("n1"), "Node A", "default");
        var b = new GraphNode(new NodeId("n1"), "Node A", "default");
        a.Should().Be(b);
    }

    [Fact]
    public void GraphSnapshot_HoldsNodesAndEdges()
    {
        var node = new GraphNode(new NodeId("n1"), "A", "type");
        var edge = new GraphEdge(new EdgeId("e1"), new NodeId("n1"), new NodeId("n2"));
        var snapshot = new GraphSnapshot(1, [node], [edge]);

        snapshot.Nodes.Should().HaveCount(1);
        snapshot.Edges.Should().HaveCount(1);
        snapshot.Version.Should().Be(1);
    }

    [Fact]
    public void NodeId_ToString_ReturnsValue()
    {
        new NodeId("abc").ToString().Should().Be("abc");
    }
}
