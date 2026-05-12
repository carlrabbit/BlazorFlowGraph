using BlazorFlowGraph.Projection;
using BlazorFlowGraph.Semantics;

namespace BlazorFlowGraph.Projection.Tests;

[SemanticNode(Label = "Service A", Kind = "service")]
public class ServiceA
{
    [SemanticEdge(Label = "calls")]
    public ServiceB? Dependency { get; set; }
}

[SemanticNode(Label = "Service B", Kind = "service")]
public class ServiceB { }

[SemanticGroup(Label = "My Group", Kind = "cluster")]
public class ServiceGroup
{
    public ServiceA? MemberA { get; set; }
    public ServiceB? MemberB { get; set; }
}

public class ReflectionGraphProjectorTests
{
    private readonly ReflectionGraphProjector _projector = new();

    [Test]
    public async Task Project_SemanticObjects_ProducesNodes()
    {
        var a = new ServiceA();
        var b = new ServiceB();
        a.Dependency = b;

        var snapshot = _projector.Project([a, b], version: 1);

        await Assert.That(snapshot.Nodes).Count().IsEqualTo(2);
        await Assert.That(snapshot.Version).IsEqualTo(1);
    }

    [Test]
    public async Task Project_SemanticEdge_ProducesEdge()
    {
        var a = new ServiceA();
        var b = new ServiceB();
        a.Dependency = b;

        var snapshot = _projector.Project([a, b]);

        await Assert.That(snapshot.Edges).Count().IsEqualTo(1);
    }

    [Test]
    public async Task Project_NonAnnotatedObject_IsIgnored()
    {
        var snapshot = _projector.Project([new object()]);
        await Assert.That(snapshot.Nodes).IsEmpty();
    }

    [Test]
    public async Task Project_NodeLabel_UsesAttributeLabel()
    {
        var a = new ServiceA();
        var snapshot = _projector.Project([a]);
        await Assert.That(snapshot.Nodes[0].Label).IsEqualTo("Service A");
    }

    [Test]
    public async Task Project_NoGroupAnnotations_GroupsIsNull()
    {
        var a = new ServiceA();
        var b = new ServiceB();
        var snapshot = _projector.Project([a, b]);
        await Assert.That(snapshot.Groups).IsNull();
    }

    [Test]
    public async Task Project_SemanticGroup_ProducesGroup()
    {
        var a = new ServiceA();
        var b = new ServiceB();
        var group = new ServiceGroup { MemberA = a, MemberB = b };

        var snapshot = _projector.Project([a, b, group]);

        await Assert.That(snapshot.Groups).Count().IsEqualTo(1);
        await Assert.That(snapshot.Groups![0].Label).IsEqualTo("My Group");
        await Assert.That(snapshot.Groups[0].Kind).IsEqualTo("cluster");
    }

    [Test]
    public async Task Project_SemanticGroup_ChildIdsMatchMemberNodes()
    {
        var a = new ServiceA();
        var b = new ServiceB();
        var group = new ServiceGroup { MemberA = a, MemberB = b };

        var snapshot = _projector.Project([a, b, group]);

        await Assert.That(snapshot.Groups![0].ChildNodeIds).Count().IsEqualTo(2);
    }

    [Test]
    public async Task Project_PropertyBasedConfiguration_ProducesNodesAndEdges()
    {
        var a = new ConfiguredServiceA();
        var b = new ConfiguredServiceB();
        a.Dependency = b;

        var snapshot = _projector.Project([a, b]);

        await Assert.That(snapshot.Nodes).Count().IsEqualTo(2);
        await Assert.That(snapshot.Nodes.Select(node => node.Label)).IsEquivalentTo(["Configured Service A", "Configured Service B"]);
        await Assert.That(snapshot.Edges).Count().IsEqualTo(1);
        await Assert.That(snapshot.Edges[0].Label).IsEqualTo("calls");
    }

    [Test]
    public async Task Project_PropertyBasedGroup_UsesConfiguredMembers()
    {
        var a = new ConfiguredServiceA();
        var b = new ConfiguredServiceB();
        var group = new ConfiguredServiceGroup { MemberA = a, MemberB = b };

        var snapshot = _projector.Project([a, b, group]);

        await Assert.That(snapshot.Groups).Count().IsEqualTo(1);
        await Assert.That(snapshot.Groups![0].Label).IsEqualTo("Configured Group");
        await Assert.That(snapshot.Groups[0].ChildNodeIds).Count().IsEqualTo(2);
    }

    private sealed class ConfiguredServiceA
    {
        public SemanticConfiguration Visualization { get; } = new(
            Node: new SemanticNodeDefinition(Label: "Configured Service A", Kind: "service"),
            Edges:
            [
                SemanticEdgeDefinition.Create<ConfiguredServiceA>(service => service.Dependency, "calls")
            ]);

        public ConfiguredServiceB? Dependency { get; set; }
    }

    private sealed class ConfiguredServiceB
    {
        public SemanticConfiguration Visualization { get; } = new(
            Node: new SemanticNodeDefinition(Label: "Configured Service B", Kind: "service"));
    }

    private sealed class ConfiguredServiceGroup
    {
        public SemanticConfiguration Visualization { get; } = new(
            Group: new SemanticGroupDefinition(
                Label: "Configured Group",
                Kind: "cluster",
                ChildMembers: [nameof(MemberA), nameof(MemberB)]));

        public ConfiguredServiceA? MemberA { get; set; }
        public ConfiguredServiceB? MemberB { get; set; }
    }
}
