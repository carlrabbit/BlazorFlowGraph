using Diagram.Protocol;

namespace Diagram.Protocol.Tests;

public class GraphContractsTests
{
    [Test]
    public async Task GraphNode_Equality_BasedOnValues()
    {
        var a = new GraphNode(new NodeId("n1"), "Node A", "default");
        var b = new GraphNode(new NodeId("n1"), "Node A", "default");
        await Assert.That(a).IsEqualTo(b);
    }

    [Test]
    public async Task GraphSnapshot_HoldsNodesAndEdges()
    {
        var node = new GraphNode(new NodeId("n1"), "A", "type");
        var edge = new GraphEdge(new EdgeId("e1"), new NodeId("n1"), new NodeId("n2"));
        var snapshot = new GraphSnapshot(1, [node], [edge]);

        await Assert.That(snapshot.Nodes).Count().IsEqualTo(1);
        await Assert.That(snapshot.Edges).Count().IsEqualTo(1);
        await Assert.That(snapshot.Version).IsEqualTo(1);
    }

    [Test]
    public async Task NodeId_ToString_ReturnsValue()
    {
        await Assert.That(new NodeId("abc").ToString()).IsEqualTo("abc");
    }
}
