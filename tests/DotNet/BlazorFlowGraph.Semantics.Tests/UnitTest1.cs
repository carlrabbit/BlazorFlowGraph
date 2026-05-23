namespace BlazorFlowGraph.Semantics.Tests;

[SemanticNode(Kind = "component")]
public class SampleComponent { }

[SemanticGroup(Kind = "cluster")]
public class SampleGroup { }

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

    [Test]
    public async Task SemanticGroupAttribute_DefaultKind_IsDefault()
    {
        var attr = new SemanticGroupAttribute();
        await Assert.That(attr.Kind).IsEqualTo("default");
    }

    [Test]
    public async Task SemanticGroupAttribute_CanBeApplied()
    {
        var attrs = typeof(SampleGroup)
            .GetCustomAttributes(typeof(SemanticGroupAttribute), inherit: true);
        await Assert.That(attrs.Length).IsEqualTo(1);
    }

    [Test]
    public async Task SemanticGroupAttribute_Kind_IsPreserved()
    {
        var attr = (SemanticGroupAttribute)typeof(SampleGroup)
            .GetCustomAttributes(typeof(SemanticGroupAttribute), inherit: true)[0];
        await Assert.That(attr.Kind).IsEqualTo("cluster");
    }

    [Test]
    public async Task SemanticGroupAttribute_LabelIsNullByDefault()
    {
        var attr = new SemanticGroupAttribute();
        await Assert.That(attr.Label).IsNull();
    }
}

