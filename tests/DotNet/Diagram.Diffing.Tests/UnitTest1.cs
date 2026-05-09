using Diagram.Diffing;
using Diagram.Protocol;

namespace Diagram.Diffing.Tests;

public class GraphDifferTests
{
    private readonly GraphDiffer _differ = new();

    private static GraphSnapshot Empty(int version = 0) =>
        new(version, [], []);

    [Test]
    public async Task Diff_AddedNodes_ReturnsAddOperations()
    {
        var from = Empty(0);
        var node = new GraphNode(new NodeId("n1"), "Node 1", "default");
        var to = new GraphSnapshot(1, [node], []);

        var diff = _differ.Diff(from, to);

        await Assert.That(diff.NodeOperations).Count().IsEqualTo(1);
        await Assert.That(diff.NodeOperations[0].Type).IsEqualTo(DiffOperationType.Add);
        await Assert.That(diff.NodeOperations[0].Node).IsEqualTo(node);
    }

    [Test]
    public async Task Diff_RemovedNodes_ReturnsRemoveOperations()
    {
        var node = new GraphNode(new NodeId("n1"), "Node 1", "default");
        var from = new GraphSnapshot(0, [node], []);
        var to = Empty(1);

        var diff = _differ.Diff(from, to);

        await Assert.That(diff.NodeOperations).Count().IsEqualTo(1);
        await Assert.That(diff.NodeOperations[0].Type).IsEqualTo(DiffOperationType.Remove);
    }

    [Test]
    public async Task Diff_UpdatedNode_ReturnsUpdateOperation()
    {
        var original = new GraphNode(new NodeId("n1"), "Old Label", "default");
        var updated = new GraphNode(new NodeId("n1"), "New Label", "default");
        var from = new GraphSnapshot(0, [original], []);
        var to = new GraphSnapshot(1, [updated], []);

        var diff = _differ.Diff(from, to);

        await Assert.That(diff.NodeOperations).Count().IsEqualTo(1);
        await Assert.That(diff.NodeOperations[0].Type).IsEqualTo(DiffOperationType.Update);
        await Assert.That(diff.NodeOperations[0].Node.Label).IsEqualTo("New Label");
    }

    [Test]
    public async Task Diff_UnchangedNodes_ReturnsNoOperations()
    {
        var node = new GraphNode(new NodeId("n1"), "Node 1", "default");
        var from = new GraphSnapshot(0, [node], []);
        var to = new GraphSnapshot(1, [node], []);

        var diff = _differ.Diff(from, to);

        await Assert.That(diff.NodeOperations).IsEmpty();
    }

    [Test]
    public async Task Diff_Versions_ArePreserved()
    {
        var diff = _differ.Diff(Empty(3), Empty(7));
        await Assert.That(diff.FromVersion).IsEqualTo(3);
        await Assert.That(diff.ToVersion).IsEqualTo(7);
    }
}
