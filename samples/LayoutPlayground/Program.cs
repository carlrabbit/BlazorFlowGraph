using BlazorFlowGraph.Diffing;
using BlazorFlowGraph.Projection;
using BlazorFlowGraph.Semantics;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseStaticWebAssets();

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddSingleton<IGraphProjector, ReflectionGraphProjector>();
builder.Services.AddSingleton<IGraphDiffer, GraphDiffer>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<LayoutPlayground.Components.App>()
    .AddInteractiveServerRenderMode();

app.Run();
