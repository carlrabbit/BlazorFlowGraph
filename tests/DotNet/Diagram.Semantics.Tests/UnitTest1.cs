using Diagram.Semantics;

namespace Diagram.Semantics.Tests;

[SemanticNode(Kind = "component")]
public class SampleComponent { }

public class SemanticAttributesTests
{
    [Fact]
    public void SemanticNodeAttribute_DefaultKind_IsDefault()
    {
        var attr = new SemanticNodeAttribute();
        attr.Kind.Should().Be("default");
    }

    [Fact]
    public void SemanticNodeAttribute_CanBeApplied()
    {
        var attrs = typeof(SampleComponent)
            .GetCustomAttributes(typeof(SemanticNodeAttribute), inherit: true);
        attrs.Should().HaveCount(1);
    }

    [Fact]
    public void SemanticNodeAttribute_Kind_IsPreserved()
    {
        var attr = (SemanticNodeAttribute)typeof(SampleComponent)
            .GetCustomAttributes(typeof(SemanticNodeAttribute), inherit: true)[0];
        attr.Kind.Should().Be("component");
    }

    [Fact]
    public void SemanticEdgeAttribute_CanBeCreated()
    {
        var attr = new SemanticEdgeAttribute { Label = "depends-on" };
        attr.Label.Should().Be("depends-on");
    }
}
