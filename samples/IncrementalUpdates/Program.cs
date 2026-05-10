using BlazorFlowGraph.Diffing;
using BlazorFlowGraph.Projection;
using BlazorFlowGraph.Semantics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Register dataflow visualizer services
builder.Services.AddSingleton<IGraphProjector, ReflectionGraphProjector>();
builder.Services.AddSingleton<IGraphDiffer, GraphDiffer>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<IncrementalUpdates.Components.App>()
    .AddInteractiveServerRenderMode();

app.Run();
