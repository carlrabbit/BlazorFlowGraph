using BlazorFlowGraph.Diffing;
using BlazorFlowGraph.Protocol;

namespace BlazorFlowGraph.Diffing.Tests;

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

    [Test]
    public async Task Diff_ProtocolVersion_IsCopiedFromTargetSnapshot()
    {
        var from = new GraphSnapshot(0, [], [], ProtocolVersion: 1);
        var to = new GraphSnapshot(1, [], [], ProtocolVersion: 2);

        var diff = _differ.Diff(from, to);

        await Assert.That(diff.ProtocolVersion).IsEqualTo(2);
    }

    [Test]
    public async Task Diff_BothSnapshotsNoGroups_GroupOperationsIsNull()
    {
        var diff = _differ.Diff(Empty(0), Empty(1));
        await Assert.That(diff.GroupOperations).IsNull();
    }

    [Test]
    public async Task Diff_AddedGroups_ReturnsAddOperations()
    {
        var group = new GraphGroup(new GroupId("g1"), "Group 1", "cluster", [new NodeId("n1")]);
        var from = Empty(0);
        var to = new GraphSnapshot(1, [], [], [group]);

        var diff = _differ.Diff(from, to);

        await Assert.That(diff.GroupOperations).Count().IsEqualTo(1);
        await Assert.That(diff.GroupOperations![0].Type).IsEqualTo(DiffOperationType.Add);
        await Assert.That(diff.GroupOperations[0].Group).IsEqualTo(group);
    }

    [Test]
    public async Task Diff_RemovedGroups_ReturnsRemoveOperations()
    {
        var group = new GraphGroup(new GroupId("g1"), "Group 1", "cluster", []);
        var from = new GraphSnapshot(0, [], [], [group]);
        var to = Empty(1);

        var diff = _differ.Diff(from, to);

        await Assert.That(diff.GroupOperations).Count().IsEqualTo(1);
        await Assert.That(diff.GroupOperations![0].Type).IsEqualTo(DiffOperationType.Remove);
    }

    [Test]
    public async Task Diff_UpdatedGroup_ReturnsUpdateOperation()
    {
        var original = new GraphGroup(new GroupId("g1"), "Old Label", "cluster", []);
        var updated = new GraphGroup(new GroupId("g1"), "New Label", "cluster", []);
        var from = new GraphSnapshot(0, [], [], [original]);
        var to = new GraphSnapshot(1, [], [], [updated]);

        var diff = _differ.Diff(from, to);

        await Assert.That(diff.GroupOperations).Count().IsEqualTo(1);
        await Assert.That(diff.GroupOperations![0].Type).IsEqualTo(DiffOperationType.Update);
        await Assert.That(diff.GroupOperations[0].Group.Label).IsEqualTo("New Label");
    }

    [Test]
    public async Task Diff_UnchangedGroups_ReturnsNoGroupOperations()
    {
        var group = new GraphGroup(new GroupId("g1"), "Group 1", "cluster", []);
        var from = new GraphSnapshot(0, [], [], [group]);
        var to = new GraphSnapshot(1, [], [], [group]);

        var diff = _differ.Diff(from, to);

        await Assert.That(diff.GroupOperations).IsEmpty();
    }
}
