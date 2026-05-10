using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.JSInterop;
using BlazorFlowGraph.Protocol;

namespace BlazorFlowGraph.Blazor;

/// <summary>
/// Blazor component that renders the dataflow graph using the TypeScript runtime.
/// The TypeScript browser bundle must be loaded by the host page before this
/// component is rendered. Call <c>DataflowVisualizer.mount()</c> is handled
/// automatically during first render.
/// </summary>
public sealed partial class DataflowGraph : ComponentBase, IAsyncDisposable
{
    [Inject]
    private IJSRuntime JS { get; set; } = default!;

    [Parameter]
    public GraphSnapshot? Snapshot { get; set; }

    [Parameter]
    public int Width { get; set; } = 800;

    [Parameter]
    public int Height { get; set; } = 600;

    [Parameter]
    public string ContainerCssClass { get; set; } = string.Empty;

    private string ContainerId { get; } = $"dfg-{Guid.NewGuid():N}";
    private bool _initialized;
    private int? _lastSnapshotVersion;

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");
        builder.AddAttribute(1, "id", ContainerId);
        builder.AddAttribute(2, "class", $"dataflow-graph {ContainerCssClass}".Trim());
        builder.AddAttribute(3, "style", $"width:{Width}px;height:{Height}px;overflow:hidden;");
        builder.CloseElement();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await JS.InvokeVoidAsync(
                "DataflowVisualizer.mount",
                new { container = $"#{ContainerId}", width = Width, height = Height });
            _initialized = true;
        }

        if (_initialized && Snapshot is not null && Snapshot.Version != _lastSnapshotVersion)
        {
            _lastSnapshotVersion = Snapshot.Version;
            await SendSnapshotAsync(Snapshot);
        }
    }

    private async Task SendSnapshotAsync(GraphSnapshot snapshot)
    {
        // Project NodeId/EdgeId record structs to plain strings to match the TypeScript
        // GraphSnapshot protocol interface which uses string literals for all IDs.
        var jsSnapshot = new
        {
            version = snapshot.Version,
            nodes = snapshot.Nodes.Select(n => new
            {
                id = n.Id.Value,
                label = n.Label,
                kind = n.Kind,
                metadata = n.Metadata,
            }).ToArray(),
            edges = snapshot.Edges.Select(e => new
            {
                id = e.Id.Value,
                sourceId = e.SourceId.Value,
                targetId = e.TargetId.Value,
                label = e.Label,
            }).ToArray(),
        };

        await JS.InvokeVoidAsync("DataflowVisualizer.receiveSnapshot", jsSnapshot);
    }

    public async ValueTask DisposeAsync()
    {
        if (_initialized)
        {
            try
            {
                await JS.InvokeVoidAsync("DataflowVisualizer.unmount", $"#{ContainerId}");
            }
            catch (JSDisconnectedException)
            {
                // Circuit may already be disconnected during disposal — ignore.
            }
        }
    }
}
