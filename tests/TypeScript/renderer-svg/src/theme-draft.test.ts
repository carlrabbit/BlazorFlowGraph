import { describe, expect, it } from "bun:test";
import { computeLayout } from "@dataflow-visualizer/layout";
import {
  FLOW_GRAPH_THEME_DRAFT_FORMAT,
  FLOW_GRAPH_THEME_DRAFT_VERSION,
  getBuiltInFlowGraphThemes,
  parseFlowGraphThemeDraftJson,
  renderThemedSvg,
  serializeFlowGraphThemeDraft,
  validateFlowGraphThemeDraft,
} from "@dataflow-visualizer/renderer-svg";
import { applySnapshot } from "@dataflow-visualizer/runtime";

describe("flow graph theme drafts", () => {
  it("validates built-in themes", () => {
    const themes = getBuiltInFlowGraphThemes();
    for (const theme of Object.values(themes)) {
      expect(validateFlowGraphThemeDraft(theme)).toEqual([]);
    }
  });

  it("round-trips exported JSON", () => {
    const theme = getBuiltInFlowGraphThemes()["default-light-draft"];
    const json = serializeFlowGraphThemeDraft(theme);
    const parsed = parseFlowGraphThemeDraftJson(json);
    expect(parsed.errors).toEqual([]);
    expect(parsed.theme).toEqual(theme);
  });

  it("rejects unsupported format marker and version", () => {
    const invalid = {
      metadata: {
        format: "other-format",
        version: 99,
        name: "Broken",
      },
      color: getBuiltInFlowGraphThemes()["default-light-draft"].color,
      size: getBuiltInFlowGraphThemes()["default-light-draft"].size,
      typography: getBuiltInFlowGraphThemes()["default-light-draft"].typography,
      motion: getBuiltInFlowGraphThemes()["default-light-draft"].motion,
    };
    const errors = validateFlowGraphThemeDraft(invalid);
    expect(errors.some((error) => error.includes(FLOW_GRAPH_THEME_DRAFT_FORMAT))).toBeTrue();
    expect(errors.some((error) => error.includes(String(FLOW_GRAPH_THEME_DRAFT_VERSION)))).toBeTrue();
  });
});

describe("renderThemedSvg", () => {
  it("renders theme colors and interaction state accents", () => {
    const snapshot = {
      version: 1,
      nodes: [
        { id: "source", label: "Source", kind: "gateway", metadata: { subtitle: "selected" } },
        { id: "sink", label: "Sink", kind: "datastore", metadata: { subtitle: "warning" } },
      ],
      edges: [{ id: "e1", sourceId: "source", targetId: "sink", label: "writes" }],
    };
    const state = applySnapshot(snapshot);
    const layout = computeLayout(snapshot, { nodeWidth: 150, nodeHeight: 58 });
    const theme = getBuiltInFlowGraphThemes()["default-light-draft"];

    const svg = renderThemedSvg(
      state,
      layout,
      { width: 360, height: 220, nodeWidth: 150, nodeHeight: 58 },
      theme,
      {
        selectedNodeIds: ["source"],
        focusedNodeIds: ["source"],
        searchMatchNodeIds: ["sink"],
        nodeChangeStates: { sink: "changed" },
        nodeDiagnosticStates: { sink: "warning" },
        highlightedEdgeIds: ["e1"],
      },
    );

    expect(svg).toContain(theme.color.canvasBackground);
    expect(svg).toContain(theme.color.selection);
    expect(svg).toContain(theme.color.focus);
    expect(svg).toContain(theme.color.searchMatch);
    expect(svg).toContain(theme.color.stateWarning);
    expect(svg).toContain("CHG");
  });
});
