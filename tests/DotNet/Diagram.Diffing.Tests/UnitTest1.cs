using Diagram.Diffing;
using Diagram.Protocol;

namespace Diagram.Diffing.Tests;

public class GraphDifferTests
{
    private readonly GraphDiffer _differ = new();

    private static GraphSnapshot Empty(int version = 0) =>
        new(version, [], []);

    [Fact]
    public void Diff_AddedNodes_ReturnsAddOperations()
    {
        var from = Empty(0);
        var node = new GraphNode(new NodeId("n1"), "Node 1", "default");
        var to = new GraphSnapshot(1, [node], []);

        var diff = _differ.Diff(from, to);

        diff.NodeOperations.Should().HaveCount(1);
        diff.NodeOperations[0].Type.Should().Be(DiffOperationType.Add);
        diff.NodeOperations[0].Node.Should().Be(node);
    }

    [Fact]
    public void Diff_RemovedNodes_ReturnsRemoveOperations()
    {
        var node = new GraphNode(new NodeId("n1"), "Node 1", "default");
        var from = new GraphSnapshot(0, [node], []);
        var to = Empty(1);

        var diff = _differ.Diff(from, to);

        diff.NodeOperations.Should().HaveCount(1);
        diff.NodeOperations[0].Type.Should().Be(DiffOperationType.Remove);
    }

    [Fact]
    public void Diff_UpdatedNode_ReturnsUpdateOperation()
    {
        var original = new GraphNode(new NodeId("n1"), "Old Label", "default");
        var updated = new GraphNode(new NodeId("n1"), "New Label", "default");
        var from = new GraphSnapshot(0, [original], []);
        var to = new GraphSnapshot(1, [updated], []);

        var diff = _differ.Diff(from, to);

        diff.NodeOperations.Should().HaveCount(1);
        diff.NodeOperations[0].Type.Should().Be(DiffOperationType.Update);
        diff.NodeOperations[0].Node.Label.Should().Be("New Label");
    }

    [Fact]
    public void Diff_UnchangedNodes_ReturnsNoOperations()
    {
        var node = new GraphNode(new NodeId("n1"), "Node 1", "default");
        var from = new GraphSnapshot(0, [node], []);
        var to = new GraphSnapshot(1, [node], []);

        var diff = _differ.Diff(from, to);

        diff.NodeOperations.Should().BeEmpty();
    }

    [Fact]
    public void Diff_Versions_ArePreserved()
    {
        var diff = _differ.Diff(Empty(3), Empty(7));
        diff.FromVersion.Should().Be(3);
        diff.ToVersion.Should().Be(7);
    }
}
