using BlazorFlowGraph.Blazor;
using BlazorFlowGraph.Diffing;
using BlazorFlowGraph.Projection;
using BlazorFlowGraph.Semantics;
using Microsoft.Extensions.DependencyInjection;

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
        services.AddSingleton<IGraphProjector, ReflectionGraphProjector>();
        services.AddSingleton<IGraphDiffer, GraphDiffer>();
        return services;
    }
}
