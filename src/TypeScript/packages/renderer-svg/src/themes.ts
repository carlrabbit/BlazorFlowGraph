export const FLOW_GRAPH_THEME_DRAFT_FORMAT = "blazor-flow-graph-theme-draft" as const;
export const FLOW_GRAPH_THEME_DRAFT_VERSION = 1 as const;

export type BuiltInFlowGraphThemeName =
  | "default-light-draft"
  | "default-dark-draft"
  | "high-contrast-draft";

export interface FlowGraphThemeDraft {
  readonly metadata: {
    readonly format: typeof FLOW_GRAPH_THEME_DRAFT_FORMAT;
    readonly version: typeof FLOW_GRAPH_THEME_DRAFT_VERSION;
    readonly name: string;
    readonly description?: string;
  };
  readonly color: {
    readonly canvasBackground: string;
    readonly canvasGrid?: string;
    readonly nodeBackground: string;
    readonly nodeBorder: string;
    readonly nodeText: string;
    readonly nodeMutedText: string;
    readonly nodeHeaderBackground?: string;
    readonly groupBackground: string;
    readonly groupBorder: string;
    readonly groupText: string;
    readonly portFill: string;
    readonly portBorder: string;
    readonly edgeDefault: string;
    readonly edgeHighlighted: string;
    readonly edgeMuted: string;
    readonly selection: string;
    readonly focus: string;
    readonly searchMatch: string;
    readonly stateAdded: string;
    readonly stateChanged: string;
    readonly stateRemoved: string;
    readonly stateWarning: string;
    readonly stateError: string;
    readonly stateStale: string;
  };
  readonly size: {
    readonly nodeRadius: number;
    readonly nodeBorderWidth: number;
    readonly nodePaddingX: number;
    readonly nodePaddingY: number;
    readonly portRadius: number;
    readonly edgeWidth: number;
    readonly selectedEdgeWidth: number;
    readonly groupRadius: number;
    readonly hitAreaPadding: number;
  };
  readonly typography: {
    readonly fontFamily: string;
    readonly monoFontFamily: string;
    readonly labelSize: number;
    readonly metadataSize: number;
    readonly groupLabelSize: number;
  };
  readonly motion: {
    readonly updateDurationMs: number;
    readonly selectionDurationMs: number;
    readonly reduceMotion: boolean;
  };
}

const DEFAULT_LIGHT_DRAFT: FlowGraphThemeDraft = {
  metadata: {
    format: FLOW_GRAPH_THEME_DRAFT_FORMAT,
    version: FLOW_GRAPH_THEME_DRAFT_VERSION,
    name: "Default Light Draft",
    description: "Calm technical light theme for dataflow iteration.",
  },
  color: {
    canvasBackground: "#f8fafc",
    canvasGrid: "#dbe4ee",
    nodeBackground: "#ffffff",
    nodeBorder: "#cbd5e1",
    nodeText: "#0f172a",
    nodeMutedText: "#64748b",
    nodeHeaderBackground: "#eef2ff",
    groupBackground: "#e2e8f0",
    groupBorder: "#94a3b8",
    groupText: "#334155",
    portFill: "#ffffff",
    portBorder: "#64748b",
    edgeDefault: "#94a3b8",
    edgeHighlighted: "#2563eb",
    edgeMuted: "#cbd5e1",
    selection: "#2563eb",
    focus: "#0f766e",
    searchMatch: "#f59e0b",
    stateAdded: "#16a34a",
    stateChanged: "#2563eb",
    stateRemoved: "#dc2626",
    stateWarning: "#d97706",
    stateError: "#dc2626",
    stateStale: "#64748b",
  },
  size: {
    nodeRadius: 10,
    nodeBorderWidth: 1.5,
    nodePaddingX: 14,
    nodePaddingY: 10,
    portRadius: 4,
    edgeWidth: 1.5,
    selectedEdgeWidth: 2.5,
    groupRadius: 16,
    hitAreaPadding: 6,
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    monoFontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    labelSize: 13,
    metadataSize: 11,
    groupLabelSize: 12,
  },
  motion: {
    updateDurationMs: 160,
    selectionDurationMs: 100,
    reduceMotion: false,
  },
};

const DEFAULT_DARK_DRAFT: FlowGraphThemeDraft = {
  metadata: {
    format: FLOW_GRAPH_THEME_DRAFT_FORMAT,
    version: FLOW_GRAPH_THEME_DRAFT_VERSION,
    name: "Default Dark Draft",
    description: "Calm technical dark theme for dense graph review.",
  },
  color: {
    canvasBackground: "#0f172a",
    canvasGrid: "#1e293b",
    nodeBackground: "#111827",
    nodeBorder: "#334155",
    nodeText: "#e2e8f0",
    nodeMutedText: "#94a3b8",
    nodeHeaderBackground: "#1d4ed8",
    groupBackground: "#172033",
    groupBorder: "#475569",
    groupText: "#cbd5e1",
    portFill: "#0f172a",
    portBorder: "#94a3b8",
    edgeDefault: "#64748b",
    edgeHighlighted: "#60a5fa",
    edgeMuted: "#334155",
    selection: "#93c5fd",
    focus: "#5eead4",
    searchMatch: "#fbbf24",
    stateAdded: "#4ade80",
    stateChanged: "#60a5fa",
    stateRemoved: "#f87171",
    stateWarning: "#f59e0b",
    stateError: "#fb7185",
    stateStale: "#94a3b8",
  },
  size: {
    nodeRadius: 10,
    nodeBorderWidth: 1.5,
    nodePaddingX: 14,
    nodePaddingY: 10,
    portRadius: 4,
    edgeWidth: 1.5,
    selectedEdgeWidth: 2.75,
    groupRadius: 16,
    hitAreaPadding: 6,
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    monoFontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    labelSize: 13,
    metadataSize: 11,
    groupLabelSize: 12,
  },
  motion: {
    updateDurationMs: 160,
    selectionDurationMs: 100,
    reduceMotion: false,
  },
};

const HIGH_CONTRAST_DRAFT: FlowGraphThemeDraft = {
  metadata: {
    format: FLOW_GRAPH_THEME_DRAFT_FORMAT,
    version: FLOW_GRAPH_THEME_DRAFT_VERSION,
    name: "High Contrast Draft",
    description: "High-contrast theme emphasizing outlines and state clarity.",
  },
  color: {
    canvasBackground: "#ffffff",
    canvasGrid: "#d4d4d8",
    nodeBackground: "#ffffff",
    nodeBorder: "#111111",
    nodeText: "#111111",
    nodeMutedText: "#3f3f46",
    nodeHeaderBackground: "#fde047",
    groupBackground: "#f4f4f5",
    groupBorder: "#111111",
    groupText: "#111111",
    portFill: "#ffffff",
    portBorder: "#111111",
    edgeDefault: "#111111",
    edgeHighlighted: "#0047ff",
    edgeMuted: "#71717a",
    selection: "#ff00aa",
    focus: "#00875f",
    searchMatch: "#ff8c00",
    stateAdded: "#0a8a0a",
    stateChanged: "#0047ff",
    stateRemoved: "#c1121f",
    stateWarning: "#b45309",
    stateError: "#c1121f",
    stateStale: "#52525b",
  },
  size: {
    nodeRadius: 6,
    nodeBorderWidth: 2,
    nodePaddingX: 14,
    nodePaddingY: 10,
    portRadius: 4,
    edgeWidth: 2,
    selectedEdgeWidth: 3,
    groupRadius: 10,
    hitAreaPadding: 6,
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    monoFontFamily: "Consolas, 'Courier New', monospace",
    labelSize: 14,
    metadataSize: 12,
    groupLabelSize: 13,
  },
  motion: {
    updateDurationMs: 0,
    selectionDurationMs: 0,
    reduceMotion: true,
  },
};

export const builtInFlowGraphThemes: Readonly<
  Record<BuiltInFlowGraphThemeName, FlowGraphThemeDraft>
> = Object.freeze({
  "default-light-draft": DEFAULT_LIGHT_DRAFT,
  "default-dark-draft": DEFAULT_DARK_DRAFT,
  "high-contrast-draft": HIGH_CONTRAST_DRAFT,
});

export function cloneFlowGraphThemeDraft(theme: FlowGraphThemeDraft): FlowGraphThemeDraft {
  return JSON.parse(JSON.stringify(theme)) as FlowGraphThemeDraft;
}

export function getBuiltInFlowGraphThemes(): Record<
  BuiltInFlowGraphThemeName,
  FlowGraphThemeDraft
> {
  return {
    "default-light-draft": cloneFlowGraphThemeDraft(builtInFlowGraphThemes["default-light-draft"]),
    "default-dark-draft": cloneFlowGraphThemeDraft(builtInFlowGraphThemes["default-dark-draft"]),
    "high-contrast-draft": cloneFlowGraphThemeDraft(builtInFlowGraphThemes["high-contrast-draft"]),
  };
}

export function serializeFlowGraphThemeDraft(theme: FlowGraphThemeDraft): string {
  return JSON.stringify(theme, null, 2);
}

export function parseFlowGraphThemeDraftJson(json: string): {
  readonly theme?: FlowGraphThemeDraft;
  readonly errors: readonly string[];
} {
  try {
    const value = JSON.parse(json) as unknown;
    const errors = validateFlowGraphThemeDraft(value);
    if (errors.length > 0) {
      return { errors };
    }

    return {
      theme: value as FlowGraphThemeDraft,
      errors: [],
    };
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : "Theme JSON could not be parsed."],
    };
  }
}

export function validateFlowGraphThemeDraft(value: unknown): readonly string[] {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return ["Theme draft must be a JSON object."];
  }

  const metadata = getRecord(value, "metadata", errors);
  const color = getRecord(value, "color", errors);
  const size = getRecord(value, "size", errors);
  const typography = getRecord(value, "typography", errors);
  const motion = getRecord(value, "motion", errors);

  if (metadata != null) {
    requireString(metadata, "format", errors, "metadata");
    requireNumber(metadata, "version", errors, "metadata");
    requireString(metadata, "name", errors, "metadata");
    optionalString(metadata, "description", errors, "metadata");

    const format = metadata.format;
    if (format !== FLOW_GRAPH_THEME_DRAFT_FORMAT) {
      errors.push(
        `metadata.format must be '${FLOW_GRAPH_THEME_DRAFT_FORMAT}', received '${String(format)}'.`,
      );
    }

    const version = metadata.version;
    if (version !== FLOW_GRAPH_THEME_DRAFT_VERSION) {
      errors.push(
        `metadata.version must be ${FLOW_GRAPH_THEME_DRAFT_VERSION}, received '${String(version)}'.`,
      );
    }
  }

  if (color != null) {
    for (const field of [
      "canvasBackground",
      "nodeBackground",
      "nodeBorder",
      "nodeText",
      "nodeMutedText",
      "groupBackground",
      "groupBorder",
      "groupText",
      "portFill",
      "portBorder",
      "edgeDefault",
      "edgeHighlighted",
      "edgeMuted",
      "selection",
      "focus",
      "searchMatch",
      "stateAdded",
      "stateChanged",
      "stateRemoved",
      "stateWarning",
      "stateError",
      "stateStale",
    ] as const) {
      requireString(color, field, errors, "color");
    }

    optionalString(color, "canvasGrid", errors, "color");
    optionalString(color, "nodeHeaderBackground", errors, "color");
  }

  if (size != null) {
    for (const field of [
      "nodeRadius",
      "nodeBorderWidth",
      "nodePaddingX",
      "nodePaddingY",
      "portRadius",
      "edgeWidth",
      "selectedEdgeWidth",
      "groupRadius",
      "hitAreaPadding",
    ] as const) {
      requireNumber(size, field, errors, "size");
    }
  }

  if (typography != null) {
    requireString(typography, "fontFamily", errors, "typography");
    requireString(typography, "monoFontFamily", errors, "typography");
    requireNumber(typography, "labelSize", errors, "typography");
    requireNumber(typography, "metadataSize", errors, "typography");
    requireNumber(typography, "groupLabelSize", errors, "typography");
  }

  if (motion != null) {
    requireNumber(motion, "updateDurationMs", errors, "motion");
    requireNumber(motion, "selectionDurationMs", errors, "motion");
    requireBoolean(motion, "reduceMotion", errors, "motion");
  }

  return errors;
}

function getRecord(
  source: Record<string, unknown>,
  key: string,
  errors: string[],
): Record<string, unknown> | null {
  const value = source[key];
  if (!isRecord(value)) {
    errors.push(`${key} must be an object.`);
    return null;
  }

  return value;
}

function requireString(
  source: Record<string, unknown>,
  key: string,
  errors: string[],
  section: string,
): void {
  if (typeof source[key] !== "string" || source[key] === "") {
    errors.push(`${section}.${key} must be a non-empty string.`);
  }
}

function optionalString(
  source: Record<string, unknown>,
  key: string,
  errors: string[],
  section: string,
): void {
  const value = source[key];
  if (value != null && typeof value !== "string") {
    errors.push(`${section}.${key} must be a string when provided.`);
  }
}

function requireNumber(
  source: Record<string, unknown>,
  key: string,
  errors: string[],
  section: string,
): void {
  if (typeof source[key] !== "number" || !Number.isFinite(source[key])) {
    errors.push(`${section}.${key} must be a finite number.`);
  }
}

function requireBoolean(
  source: Record<string, unknown>,
  key: string,
  errors: string[],
  section: string,
): void {
  if (typeof source[key] !== "boolean") {
    errors.push(`${section}.${key} must be a boolean.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}
