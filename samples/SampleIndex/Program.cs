var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseStaticWebAssets();

builder.Services.AddRazorComponents();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStaticFiles();
app.UseAntiforgery();

app.MapGet("/SAMPLES.json", (IHostEnvironment env) =>
{
    var registryPath = Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "SAMPLES.json"));
    return File.Exists(registryPath)
        ? Results.File(registryPath, "application/json")
        : Results.NotFound();
});

app.MapStaticAssets();
app.MapRazorComponents<SampleIndex.Components.App>();

app.Run();
