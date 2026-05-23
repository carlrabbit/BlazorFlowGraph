/**
 * Layout package — ELK integration and layout adapters.
 * Milestone 3: adds LayoutProvider abstraction and LayoutGraph model.
 * Milestone 4: adds ElkLayoutProvider using elkjs (lazy-loaded to support tree-shaking).
 */

import type { GraphSnapshot } from "@dataflow-visualizer/protocol";

/** Controls when layout is (re)computed. */
export type LayoutPolicy = "Never" | "Incremental" | "Full" | "GroupLocal" | "Manual" | "Local" | "Frozen";

/** Stable layout coordinates that persist across graph updates. */
export interface PersistentLayoutState {
  readonly nodePositions: ReadonlyMap<string, { x: number; y: number }>;
  readonly policy: LayoutPolicy;
}

export interface LayoutNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface LayoutEdge {
  readonly id: string;
  readonly sections: readonly LayoutSection[];
}

export interface LayoutSection {
  readonly startPoint: { readonly x: number; readonly y: number };
  readonly endPoint: { readonly x: number; readonly y: number };
}

export interface LayoutResult {
  readonly nodes: ReadonlyMap<string, LayoutNode>;
  readonly edges: ReadonlyMap<string, LayoutEdge>;
  readonly width: number;
  readonly height: number;
}

export interface LayoutOptions {
  readonly algorithm?: string;
  readonly nodeWidth?: number;
  readonly nodeHeight?: number;
  readonly spacing?: number;
}

// ---------------------------------------------------------------------------
// LayoutGraph model (Phase 7) — distinct from the runtime graph
// ---------------------------------------------------------------------------

/**
 * A graph model designed specifically for layout engines.
 * This is intentionally separate from the runtime graph to decouple
 * layout concerns from semantic and rendering concerns.
 */
export interface LayoutGraphNode {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  /** Optional group membership — used by hierarchical layouts. */
  readonly groupId?: string;
}

export interface LayoutGraphEdge {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
}

export interface LayoutGraphGroup {
  readonly id: string;
  readonly childNodeIds: readonly string[];
}

/**
 * LayoutGraph is the input model for layout providers.
 * Build it from a GraphSnapshot or GraphDataState before passing to a LayoutProvider.
 */
export interface LayoutGraph {
  readonly nodes: readonly LayoutGraphNode[];
  readonly edges: readonly LayoutGraphEdge[];
  readonly groups: readonly LayoutGraphGroup[];
}

/** Builds a LayoutGraph from a GraphSnapshot. */
export function buildLayoutGraph(
  snapshot: GraphSnapshot,
  options?: { nodeWidth?: number; nodeHeight?: number }
): LayoutGraph {
  const nodeWidth = options?.nodeWidth ?? 120;
  const nodeHeight = options?.nodeHeight ?? 40;
  return {
    nodes: snapshot.nodes.map((n) => ({
      id: n.id,
      width: nodeWidth,
      height: nodeHeight,
    })),
    edges: snapshot.edges.map((e) => ({
      id: e.id,
      sourceId: e.sourceId,
      targetId: e.targetId,
    })),
    groups: (snapshot.groups ?? []).map((g) => ({
      id: g.id,
      childNodeIds: g.childNodeIds,
    })),
  };
}

// ---------------------------------------------------------------------------
// LayoutProvider interface (Phase 7)
// ---------------------------------------------------------------------------

/**
 * LayoutProvider is the abstraction for pluggable layout engines.
 * The platform includes a grid-based provider; ELK and other engines
 * can be integrated by implementing this interface.
 */
export interface LayoutProvider {
  /**
   * Computes layout positions for the given LayoutGraph.
   * Returns a Promise to support asynchronous layout engines (e.g. ELK WASM).
   */
  computeLayout(graph: LayoutGraph, options?: LayoutOptions): Promise<LayoutResult>;
}

// ---------------------------------------------------------------------------
// GridLayoutProvider (Phase 7) — wraps the existing grid layout
// ---------------------------------------------------------------------------

/**
 * GridLayoutProvider implements LayoutProvider using the built-in grid layout.
 * This is the default layout engine; replace with ELK for production quality.
 */
export class GridLayoutProvider implements LayoutProvider {
  async computeLayout(graph: LayoutGraph, options?: LayoutOptions): Promise<LayoutResult> {
    const { nodeWidth = 120, nodeHeight = 40, spacing = 20 } = options ?? {};
    const cols = Math.max(1, Math.ceil(Math.sqrt(graph.nodes.length)));

    const nodes = new Map<string, LayoutNode>(
      graph.nodes.map((node, i) => [
        node.id,
        {
          id: node.id,
          x: (i % cols) * (nodeWidth + spacing),
          y: Math.floor(i / cols) * (nodeHeight + spacing),
          width: node.width,
          height: node.height,
        },
      ])
    );

    const edges = new Map<string, LayoutEdge>(
      graph.edges.map((edge) => {
        const source = nodes.get(edge.sourceId);
        const target = nodes.get(edge.targetId);
        return [
          edge.id,
          {
            id: edge.id,
            sections:
              source != null && target != null
                ? [
                    {
                      startPoint: {
                        x: source.x + source.width / 2,
                        y: source.y + source.height,
                      },
                      endPoint: {
                        x: target.x + target.width / 2,
                        y: target.y,
                      },
                    },
                  ]
                : [],
          },
        ];
      })
    );

    const rows = Math.ceil(graph.nodes.length / cols);
    return {
      nodes,
      edges,
      width: cols * (nodeWidth + spacing),
      height: Math.max(1, rows) * (nodeHeight + spacing),
    };
  }
}

/**
 * Computes a simple grid layout for a graph snapshot.
 * Replace with ELK integration for production use.
 */
export function computeLayout(snapshot: GraphSnapshot, options: LayoutOptions = {}): LayoutResult {
  const { nodeWidth = 120, nodeHeight = 40, spacing = 20 } = options;
  const cols = Math.ceil(Math.sqrt(snapshot.nodes.length));

  const nodes = new Map<string, LayoutNode>(
    snapshot.nodes.map((node, i) => [
      node.id,
      {
        id: node.id,
        x: (i % cols) * (nodeWidth + spacing),
        y: Math.floor(i / cols) * (nodeHeight + spacing),
        width: nodeWidth,
        height: nodeHeight,
      },
    ])
  );

  const edges = new Map<string, LayoutEdge>(
    snapshot.edges.map((edge) => {
      const source = nodes.get(edge.sourceId);
      const target = nodes.get(edge.targetId);
      return [
        edge.id,
        {
          id: edge.id,
          sections:
            source != null && target != null
              ? [
                  {
                    startPoint: {
                      x: source.x + source.width / 2,
                      y: source.y + source.height,
                    },
                    endPoint: {
                      x: target.x + target.width / 2,
                      y: target.y,
                    },
                  },
                ]
              : [],
        },
      ];
    })
  );

  const cols2 = Math.max(1, cols);
  const rows = Math.ceil(snapshot.nodes.length / cols2);
  return {
    nodes,
    edges,
    width: cols2 * (nodeWidth + spacing),
    height: rows * (nodeHeight + spacing),
  };
}

// ---------------------------------------------------------------------------
// ElkLayoutProvider (Milestone 4) — ELK-backed production layout
// ---------------------------------------------------------------------------

/**
 * Minimal interface for an elkjs ELK instance, capturing only the `layout` method
 * used by `ElkLayoutProvider`. This avoids importing the full elkjs type definitions
 * into the compiled output while preserving type-safe call sites.
 */
interface ElkInstance {
  layout(graph: unknown): Promise<ElkLayoutResult>;
}

/** Minimal subset of the ELK layout result used by ElkLayoutProvider. */
interface ElkLayoutResult {
  children?: Array<{
    id: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }>;
  edges?: Array<{
    id: string;
    sections?: Array<{
      startPoint: { x: number; y: number };
      endPoint: { x: number; y: number };
    }>;
  }>;
}

/** Lazily constructs an ELK instance from the elkjs dynamic import. */
async function createElkInstance(): Promise<ElkInstance> {
  const mod = await import("elkjs/lib/elk.bundled.js");
  // elkjs exports its constructor as the default export.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
  return new (mod.default as new () => ElkInstance)();
}

/**
 * ElkLayoutProvider implements LayoutProvider using the Eclipse Layout Kernel (ELK).
 *
 * ELK provides production-quality hierarchical layout algorithms (layered, force,
 * mrtree, box, etc.) via elkjs. This is the recommended layout engine for graphs
 * with more than a few nodes or non-trivial topologies.
 *
 * ELK is loaded lazily via dynamic import on first use to avoid bundling it into
 * applications that only use the GridLayoutProvider.
 *
 * Usage:
 * ```typescript
 * const provider = new ElkLayoutProvider({ algorithm: "layered" });
 * const layout = await provider.computeLayout(graph);
 * ```
 */
export class ElkLayoutProvider implements LayoutProvider {
  private readonly defaultAlgorithm: string;
  private elkInstance: ElkInstance | null = null;

  constructor(options?: { algorithm?: string }) {
    this.defaultAlgorithm = options?.algorithm ?? "layered";
  }

  private async getElk(): Promise<ElkInstance> {
    if (this.elkInstance == null) {
      // Dynamic import keeps elkjs out of the module graph unless this
      // provider is actually instantiated, supporting tree-shaking for
      // consumers that only use GridLayoutProvider.
      this.elkInstance = await createElkInstance();
    }
    return this.elkInstance;
  }

  async computeLayout(graph: LayoutGraph, options?: LayoutOptions): Promise<LayoutResult> {
    const nodeWidth = options?.nodeWidth ?? 120;
    const nodeHeight = options?.nodeHeight ?? 40;
    const spacing = options?.spacing ?? 20;
    const algorithm = options?.algorithm ?? this.defaultAlgorithm;

    // Build ELK graph input
    const elkGraph = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": algorithm,
        "elk.spacing.nodeNode": String(spacing),
        "elk.padding": `[top=${spacing},left=${spacing},bottom=${spacing},right=${spacing}]`,
      },
      children: graph.nodes.map((n) => ({
        id: n.id,
        width: n.width ?? nodeWidth,
        height: n.height ?? nodeHeight,
      })),
      edges: graph.edges.map((e) => ({
        id: e.id,
        sources: [e.sourceId],
        targets: [e.targetId],
      })),
    };

    let laid: ElkLayoutResult;
    try {
      const elk = await this.getElk();
      laid = await elk.layout(elkGraph);
    } catch {
      // Fall back to grid layout if ELK fails (e.g. in test environments without WASM)
      const fallback = new GridLayoutProvider();
      return fallback.computeLayout(graph, options);
    }

    // Build node positions map from ELK output
    const nodes = new Map<string, LayoutNode>();
    for (const child of laid.children ?? []) {
      nodes.set(child.id, {
        id: child.id,
        x: Math.floor(child.x ?? 0),
        y: Math.floor(child.y ?? 0),
        width: Math.floor(child.width ?? nodeWidth),
        height: Math.floor(child.height ?? nodeHeight),
      });
    }

    // Build edge sections map from ELK output
    const edges = new Map<string, LayoutEdge>();
    for (const elkEdge of laid.edges ?? []) {
      const section = elkEdge.sections?.[0];
      edges.set(elkEdge.id, {
        id: elkEdge.id,
        sections: section != null ? [{ startPoint: section.startPoint, endPoint: section.endPoint }] : [],
      });
    }

    // Compute overall canvas dimensions from positioned nodes
    let maxX = 0;
    let maxY = 0;
    for (const n of nodes.values()) {
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    }

    return {
      nodes,
      edges,
      width: maxX + spacing,
      height: maxY + spacing,
    };
  }
}
