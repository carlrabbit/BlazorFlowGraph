/**
 * Layout package — ELK integration and layout adapters.
 */

import type { GraphSnapshot } from "@dataflow-visualizer/protocol";

/** Controls when layout is (re)computed. */
export type LayoutPolicy = "Never" | "Incremental" | "Full" | "GroupLocal" | "Manual";

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
