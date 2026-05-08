using Diagram.Projection;
using Diagram.Semantics;

namespace Diagram.Projection.Tests;

[SemanticNode(Label = "Service A", Kind = "service")]
public class ServiceA
{
    [SemanticEdge(Label = "calls")]
    public ServiceB? Dependency { get; set; }
}

[SemanticNode(Label = "Service B", Kind = "service")]
public class ServiceB { }

public class ReflectionGraphProjectorTests
{
    private readonly ReflectionGraphProjector _projector = new();

    [Fact]
    public void Project_SemanticObjects_ProducesNodes()
    {
        var a = new ServiceA();
        var b = new ServiceB();
        a.Dependency = b;

        var snapshot = _projector.Project([a, b], version: 1);

        snapshot.Nodes.Should().HaveCount(2);
        snapshot.Version.Should().Be(1);
    }

    [Fact]
    public void Project_SemanticEdge_ProducesEdge()
    {
        var a = new ServiceA();
        var b = new ServiceB();
        a.Dependency = b;

        var snapshot = _projector.Project([a, b]);

        snapshot.Edges.Should().HaveCount(1);
    }

    [Fact]
    public void Project_NonAnnotatedObject_IsIgnored()
    {
        var snapshot = _projector.Project([new object()]);
        snapshot.Nodes.Should().BeEmpty();
    }

    [Fact]
    public void Project_NodeLabel_UsesAttributeLabel()
    {
        var a = new ServiceA();
        var snapshot = _projector.Project([a]);
        snapshot.Nodes[0].Label.Should().Be("Service A");
    }
}
