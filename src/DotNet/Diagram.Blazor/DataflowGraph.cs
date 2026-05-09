using Microsoft.AspNetCore.Components;
using Diagram.Protocol;

namespace Diagram.Blazor;

/// <summary>
/// Blazor component that renders the dataflow graph using the TypeScript runtime.
/// </summary>
public sealed partial class DataflowGraph : ComponentBase, IAsyncDisposable
{
    [Parameter]
    public GraphSnapshot? Snapshot { get; set; }

    [Parameter]
    public int Width { get; set; } = 800;

    [Parameter]
    public int Height { get; set; } = 600;

    [Parameter]
    public string ContainerCssClass { get; set; } = string.Empty;

    private string ContainerId { get; } = $"dfg-{Guid.NewGuid():N}";

    protected override void BuildRenderTree(Microsoft.AspNetCore.Components.Rendering.RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");
        builder.AddAttribute(1, "id", ContainerId);
        builder.AddAttribute(2, "class", $"dataflow-graph {ContainerCssClass}".Trim());
        builder.AddAttribute(3, "style", $"width:{Width}px;height:{Height}px;");
        builder.CloseElement();
    }

    public async ValueTask DisposeAsync()
    {
        await Task.CompletedTask;
    }
}
