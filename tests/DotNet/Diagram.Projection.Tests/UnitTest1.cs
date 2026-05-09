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
}
