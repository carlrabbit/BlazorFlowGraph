/**
 * Layout package — ELK integration and layout adapters.
 * Milestone 3: adds LayoutProvider abstraction and LayoutGraph model.
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
export function computeLayout(
  snapshot: GraphSnapshot,
  options: LayoutOptions = {}
): LayoutResult {
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
          sections: source != null && target != null
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
