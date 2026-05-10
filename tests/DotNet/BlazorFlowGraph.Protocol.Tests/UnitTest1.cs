using BlazorFlowGraph.Protocol;

namespace BlazorFlowGraph.Protocol.Tests;

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

    [Test]
    public async Task GroupId_ToString_ReturnsValue()
    {
        await Assert.That(new GroupId("g1").ToString()).IsEqualTo("g1");
    }

    [Test]
    public async Task GraphGroup_Equality_BasedOnValues()
    {
        var childIds = new[] { new NodeId("n1"), new NodeId("n2") };
        var a = new GraphGroup(new GroupId("g1"), "Group A", "cluster", childIds);
        var b = new GraphGroup(new GroupId("g1"), "Group A", "cluster", childIds);
        await Assert.That(a).IsEqualTo(b);
    }

    [Test]
    public async Task GraphSnapshot_WithGroups_HoldsGroups()
    {
        var node = new GraphNode(new NodeId("n1"), "A", "type");
        var group = new GraphGroup(new GroupId("g1"), "G", "cluster", [new NodeId("n1")]);
        var snapshot = new GraphSnapshot(2, [node], [], [group]);

        await Assert.That(snapshot.Groups).Count().IsEqualTo(1);
        await Assert.That(snapshot.Groups![0].Id).IsEqualTo(new GroupId("g1"));
    }

    [Test]
    public async Task GraphSnapshot_DefaultGroups_IsNull()
    {
        var snapshot = new GraphSnapshot(1, [], []);
        await Assert.That(snapshot.Groups).IsNull();
    }

    [Test]
    public async Task GraphSnapshot_DefaultProtocolVersion_IsOne()
    {
        var snapshot = new GraphSnapshot(1, [], []);
        await Assert.That(snapshot.ProtocolVersion).IsEqualTo(1);
    }

    [Test]
    public async Task GraphDiff_WithGroupOperations_HoldsGroupOps()
    {
        var group = new GraphGroup(new GroupId("g1"), "G", "cluster", []);
        var groupOp = new GroupDiffOperation(DiffOperationType.Add, group);
        var diff = new GraphDiff(0, 1, [], [], [groupOp]);

        await Assert.That(diff.GroupOperations).Count().IsEqualTo(1);
        await Assert.That(diff.GroupOperations![0].Type).IsEqualTo(DiffOperationType.Add);
    }

    [Test]
    public async Task GraphDiff_DefaultGroupOperations_IsNull()
    {
        var diff = new GraphDiff(0, 1, [], []);
        await Assert.That(diff.GroupOperations).IsNull();
    }

    [Test]
    public async Task GraphViewState_Creation()
    {
        var viewport = new ViewportSnapshot(10.0, 20.0, 1.5);
        var state = new GraphViewState(viewport, [new GroupId("g1")], [new NodeId("n1")], new NodeId("n1"));

        await Assert.That(state.Viewport.X).IsEqualTo(10.0);
        await Assert.That(state.Viewport.Y).IsEqualTo(20.0);
        await Assert.That(state.Viewport.Scale).IsEqualTo(1.5);
        await Assert.That(state.ExpandedGroupIds).Count().IsEqualTo(1);
        await Assert.That(state.SelectedNodeIds).Count().IsEqualTo(1);
        await Assert.That(state.FocusedNodeId).IsEqualTo(new NodeId("n1"));
    }

    [Test]
    public async Task GraphViewState_DefaultFocusedNode_IsNull()
    {
        var state = new GraphViewState(new ViewportSnapshot(0, 0, 1), [], []);
        await Assert.That(state.FocusedNodeId).IsNull();
    }

    [Test]
    public async Task NodeOverlay_Creation()
    {
        var overlay = new NodeOverlay(new NodeId("n1"), "highlight");
        await Assert.That(overlay.NodeId).IsEqualTo(new NodeId("n1"));
        await Assert.That(overlay.Kind).IsEqualTo("highlight");
        await Assert.That(overlay.Data).IsNull();
    }

    [Test]
    public async Task EdgeOverlay_Creation()
    {
        var overlay = new EdgeOverlay(new EdgeId("e1"), "active");
        await Assert.That(overlay.EdgeId).IsEqualTo(new EdgeId("e1"));
        await Assert.That(overlay.Kind).IsEqualTo("active");
        await Assert.That(overlay.Data).IsNull();
    }
}

