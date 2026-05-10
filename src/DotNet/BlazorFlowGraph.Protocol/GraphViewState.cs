namespace BlazorFlowGraph.Protocol;

/// <summary>
/// Serializable snapshot of the browser-side view state.
/// Used for deep links, bookmarks, and saved views.
/// </summary>
public sealed record GraphViewState(
    /// <summary>The viewport translation and scale.</summary>
    ViewportSnapshot Viewport,
    /// <summary>IDs of groups currently expanded.</summary>
    IReadOnlyList<GroupId> ExpandedGroupIds,
    /// <summary>IDs of currently selected nodes.</summary>
    IReadOnlyList<NodeId> SelectedNodeIds,
    /// <summary>The currently focused node, if any.</summary>
    NodeId? FocusedNodeId = null);

/// <summary>Snapshot of the viewport pan/zoom state.</summary>
public sealed record ViewportSnapshot(double X, double Y, double Scale);
