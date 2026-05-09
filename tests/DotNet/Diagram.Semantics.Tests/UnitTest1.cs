using Diagram.Semantics;

namespace Diagram.Semantics.Tests;

[SemanticNode(Kind = "component")]
public class SampleComponent { }

public class SemanticAttributesTests
{
    [Test]
    public async Task SemanticNodeAttribute_DefaultKind_IsDefault()
    {
        var attr = new SemanticNodeAttribute();
        await Assert.That(attr.Kind).IsEqualTo("default");
    }

    [Test]
    public async Task SemanticNodeAttribute_CanBeApplied()
    {
        var attrs = typeof(SampleComponent)
            .GetCustomAttributes(typeof(SemanticNodeAttribute), inherit: true);
        await Assert.That(attrs.Length).IsEqualTo(1);
    }

    [Test]
    public async Task SemanticNodeAttribute_Kind_IsPreserved()
    {
        var attr = (SemanticNodeAttribute)typeof(SampleComponent)
            .GetCustomAttributes(typeof(SemanticNodeAttribute), inherit: true)[0];
        await Assert.That(attr.Kind).IsEqualTo("component");
    }

    [Test]
    public async Task SemanticEdgeAttribute_CanBeCreated()
    {
        var attr = new SemanticEdgeAttribute { Label = "depends-on" };
        await Assert.That(attr.Label).IsEqualTo("depends-on");
    }
}
