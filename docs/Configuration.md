# Configuration

BlazorFlowGraph now supports a property-based semantic configuration model in addition to the original attribute-based API.

This first implementation is intended to improve DX for domain models where visualization concerns should live in a normal configuration property instead of on the type itself.

## Property-Based Configuration

Add a `SemanticConfiguration` property to a domain object and describe its node, edges, or group projection with records from `BlazorFlowGraph.Semantics`.

```csharp
using BlazorFlowGraph.Semantics;

public sealed class OrdersService
{
    public SemanticConfiguration Visualization { get; } = new(
        Node: new SemanticNodeDefinition(
            Label: "Orders Service",
            Kind: "service"),
        Edges:
        [
            SemanticEdgeDefinition.Create<OrdersService>(service => service.Database, "writes"),
            new SemanticEdgeDefinition(nameof(Cache), "caches")
        ]);

    public OrdersDatabase? Database { get; init; }

    public OrdersCache? Cache { get; init; }
}
```

## Group Configuration

Groups can also be configured with a property:

```csharp
using BlazorFlowGraph.Semantics;

public sealed class ApplicationTier
{
    public SemanticConfiguration Visualization { get; } = new(
        Group: SemanticGroupDefinition.Create<ApplicationTier>(
            label: "Application Tier",
            kind: "group",
            tier => tier.Gateway,
            tier => tier.Orders));

    public ApiGateway? Gateway { get; init; }

    public OrdersService? Orders { get; init; }
}
```

You can also use plain member names with `ChildMembers` when that is more convenient.

## Current Behavior

- property-based configuration is discovered by `ReflectionGraphProjector`
- existing `SemanticNodeAttribute`, `SemanticEdgeAttribute`, and `SemanticGroupAttribute` remain supported
- when a configuration section is present on `SemanticConfiguration`, it is used for that section; missing sections still fall back to the legacy attribute-based behavior

## Notes For Iteration

This is a first implementation focused on keeping the projection model small and compatible with the existing graph contracts.

Future iterations can expand:

- explicit configuration discovery conventions
- richer edge or group metadata
- better ergonomics for collections and nested configuration
