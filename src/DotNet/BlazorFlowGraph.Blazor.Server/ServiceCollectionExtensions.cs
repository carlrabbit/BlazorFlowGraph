using BlazorFlowGraph.Diffing;
using BlazorFlowGraph.Projection;

namespace BlazorFlowGraph.Blazor.Server;

/// <summary>
/// Extension methods for registering dataflow visualizer services.
/// </summary>
public static class DataflowVisualizerServiceCollectionExtensions
{
    /// <summary>
    /// Registers all dataflow visualizer services with the DI container.
    /// </summary>
    public static IServiceCollection AddDataflowVisualizer(this IServiceCollection services)
    {
        _ = services.AddSingleton<IGraphProjector, ReflectionGraphProjector>();
        _ = services.AddSingleton<IGraphDiffer, GraphDiffer>();
        return services;
    }
}
