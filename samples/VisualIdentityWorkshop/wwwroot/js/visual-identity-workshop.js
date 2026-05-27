(() => {
  const api = window.DataflowVisualizer;
  const root = document.getElementById("visual-identity-tool-root");
  if (api == null || root == null) {
    return;
  }

  const builtInThemes = api.getBuiltInThemes();
  const builtInThemeOptions = [
    ["default-light-draft", "Default Light Draft"],
    ["default-dark-draft", "Default Dark Draft"],
    ["high-contrast-draft", "High Contrast Draft"],
  ];

  const colorFields = [
    ["canvasBackground", "Canvas background"],
    ["canvasGrid", "Canvas grid"],
    ["nodeBackground", "Node background"],
    ["nodeBorder", "Node border"],
    ["nodeText", "Node text"],
    ["nodeMutedText", "Muted node text"],
    ["nodeHeaderBackground", "Node header background"],
    ["groupBackground", "Group background"],
    ["groupBorder", "Group border"],
    ["groupText", "Group text"],
    ["portFill", "Port fill"],
    ["portBorder", "Port border"],
    ["edgeDefault", "Default edge"],
    ["edgeHighlighted", "Highlighted edge"],
    ["edgeMuted", "Muted edge"],
    ["selection", "Selection"],
    ["focus", "Focus"],
    ["searchMatch", "Search match"],
    ["stateAdded", "Added"],
    ["stateChanged", "Changed"],
    ["stateRemoved", "Removed"],
    ["stateWarning", "Warning"],
    ["stateError", "Error"],
    ["stateStale", "Stale"],
  ];

  const sizeFields = [
    ["nodeRadius", "Node radius"],
    ["nodeBorderWidth", "Node border width"],
    ["nodePaddingX", "Node padding X"],
    ["nodePaddingY", "Node padding Y"],
    ["portRadius", "Port radius"],
    ["edgeWidth", "Edge width"],
    ["selectedEdgeWidth", "Selected edge width"],
    ["groupRadius", "Group radius"],
    ["hitAreaPadding", "Hit-area padding"],
  ];

  const typographyFields = [
    ["fontFamily", "Font family", "text"],
    ["monoFontFamily", "Mono font family", "text"],
    ["labelSize", "Label size", "number"],
    ["metadataSize", "Metadata size", "number"],
    ["groupLabelSize", "Group label size", "number"],
  ];

  const motionFields = [
    ["updateDurationMs", "Update duration", "number"],
    ["selectionDurationMs", "Selection duration", "number"],
    ["reduceMotion", "Reduce motion", "checkbox"],
  ];

  let selectedBuiltInThemeKey = "default-light-draft";
  let currentTheme = cloneTheme(builtInThemes[selectedBuiltInThemeKey]);
  let statusMessage = "";
  let importError = "";

  root.innerHTML = `
    <style>
      .vi-shell { padding: 24px; display: grid; grid-template-columns: minmax(320px, 420px) minmax(0, 1fr); gap: 24px; }
      .vi-panel, .vi-preview-panel { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 18px; box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08); }
      .vi-panel { padding: 20px; position: sticky; top: 20px; max-height: calc(100vh - 40px); overflow: auto; }
      .vi-preview-panel { padding: 20px; }
      .vi-heading { margin: 0 0 8px; font-size: 1.875rem; }
      .vi-subtitle { margin: 0 0 18px; color: #475569; line-height: 1.5; }
      .vi-control-row { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
      .vi-control-row label { font-size: 0.95rem; font-weight: 600; color: #1e293b; }
      .vi-control-row select, .vi-control-row input, .vi-control-row textarea, .vi-control-row button { font: inherit; }
      .vi-control-row select, .vi-control-row input[type="text"], .vi-control-row input[type="number"], .vi-control-row textarea { width: 100%; border: 1px solid #94a3b8; border-radius: 10px; padding: 8px 10px; background: #fff; color: #0f172a; }
      .vi-control-row textarea { min-height: 132px; resize: vertical; }
      .vi-button { border: 0; border-radius: 10px; padding: 9px 12px; background: #0f172a; color: #fff; cursor: pointer; }
      .vi-button.secondary { background: #475569; }
      .vi-status { min-height: 1.25rem; margin: 0 0 12px; font-size: 0.9rem; color: #0f766e; }
      .vi-error { color: #b91c1c; }
      .vi-section { margin-top: 18px; border-top: 1px solid #cbd5e1; padding-top: 18px; }
      .vi-section h2 { margin: 0 0 12px; font-size: 1.05rem; }
      .vi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
      .vi-field { display: grid; gap: 6px; }
      .vi-field label { font-size: 0.85rem; color: #334155; }
      .vi-field input[type="checkbox"] { width: auto; transform: scale(1.15); }
      .vi-meta { display: grid; gap: 10px; margin-bottom: 10px; }
      .vi-preview-header { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 16px; }
      .vi-preview-header h2 { margin: 0; }
      .vi-preview-header p { margin: 4px 0 0; color: #475569; }
      .vi-scenarios { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
      .vi-card { background: #fff; border: 1px solid #cbd5e1; border-radius: 16px; padding: 14px; display: grid; gap: 10px; }
      .vi-card h3 { margin: 0; font-size: 1rem; }
      .vi-card p { margin: 0; color: #475569; font-size: 0.9rem; line-height: 1.45; }
      .vi-svg-frame { border-radius: 14px; border: 1px solid #cbd5e1; overflow: hidden; background: #fff; }
      .vi-json-panels { display: grid; gap: 14px; }
      .vi-json-panels h3 { margin: 0 0 8px; font-size: 0.95rem; }
      .vi-caption { color: #64748b; font-size: 0.8rem; }
      @media (max-width: 1200px) {
        .vi-shell { grid-template-columns: 1fr; }
        .vi-panel { position: static; max-height: none; }
      }
    </style>
    <div class="vi-shell">
      <section class="vi-panel">
        <h1 class="vi-heading">Visual Identity Workshop</h1>
        <p class="vi-subtitle">Edit draft theme tokens, switch between built-in drafts, import/export JSON, and compare representative graph scenarios on one page.</p>
        <div class="vi-status" id="vi-status"></div>
        <div class="vi-control-row">
          <label for="vi-built-in-theme">Built-in theme</label>
          <select id="vi-built-in-theme"></select>
          <button class="vi-button secondary" id="vi-reset-theme" type="button">Reset to built-in</button>
        </div>
        <div class="vi-meta">
          <div class="vi-field"><label for="vi-theme-name">Theme name</label><input id="vi-theme-name" type="text" /></div>
          <div class="vi-field"><label for="vi-theme-description">Theme description</label><input id="vi-theme-description" type="text" /></div>
        </div>
        <div id="vi-color-section" class="vi-section"><h2>Color tokens</h2><div class="vi-grid"></div></div>
        <div id="vi-size-section" class="vi-section"><h2>Size tokens</h2><div class="vi-grid"></div></div>
        <div id="vi-typography-section" class="vi-section"><h2>Typography tokens</h2><div class="vi-grid"></div></div>
        <div id="vi-motion-section" class="vi-section"><h2>Motion tokens</h2><div class="vi-grid"></div></div>
        <div class="vi-section vi-json-panels">
          <div>
            <h3>Import draft JSON</h3>
            <div class="vi-control-row"><textarea id="vi-import-text"></textarea></div>
            <div class="vi-control-row">
              <button class="vi-button" id="vi-apply-import" type="button">Apply import</button>
            </div>
            <div class="vi-caption">Unsupported format markers, versions, and malformed JSON are rejected with explicit validation errors.</div>
          </div>
          <div>
            <h3>Export current draft</h3>
            <div class="vi-control-row"><textarea id="vi-export-text" readonly></textarea></div>
            <div class="vi-control-row">
              <button class="vi-button secondary" id="vi-copy-export" type="button">Copy export JSON</button>
            </div>
            <div class="vi-caption">The exported JSON is stable enough for issue discussion, diff review, and re-import.</div>
          </div>
        </div>
      </section>
      <section class="vi-preview-panel">
        <div class="vi-preview-header">
          <div>
            <h2>Representative scenarios</h2>
            <p>All scenarios update from the same live draft so visual identity decisions can be compared side by side.</p>
          </div>
          <div class="vi-caption" id="vi-active-theme-label"></div>
        </div>
        <div class="vi-scenarios" id="vi-scenarios"></div>
      </section>
    </div>
  `;

  const statusEl = root.querySelector("#vi-status");
  const builtInThemeSelect = root.querySelector("#vi-built-in-theme");
  const resetButton = root.querySelector("#vi-reset-theme");
  const nameInput = root.querySelector("#vi-theme-name");
  const descriptionInput = root.querySelector("#vi-theme-description");
  const importText = root.querySelector("#vi-import-text");
  const exportText = root.querySelector("#vi-export-text");
  const applyImportButton = root.querySelector("#vi-apply-import");
  const copyExportButton = root.querySelector("#vi-copy-export");
  const activeThemeLabel = root.querySelector("#vi-active-theme-label");
  const scenariosEl = root.querySelector("#vi-scenarios");

  const fieldRegistry = [];

  function buildSection(sectionId, sectionKey, descriptors) {
    const grid = root.querySelector(`${sectionId} .vi-grid`);
    for (const descriptor of descriptors) {
      const [key, label, explicitType] = descriptor;
      const type = explicitType ?? (sectionKey === "color" ? "text" : "number");
      const field = document.createElement("div");
      field.className = "vi-field";
      const labelEl = document.createElement("label");
      labelEl.textContent = label;
      const input = document.createElement("input");
      input.type = type;
      if (type === "number") {
        input.step = "any";
      }
      input.addEventListener(type === "checkbox" ? "change" : "input", () => {
        currentTheme[sectionKey][key] = type === "checkbox" ? input.checked : type === "number" ? Number(input.value) : input.value;
        updatePreview();
      });
      field.append(labelEl, input);
      grid.appendChild(field);
      fieldRegistry.push({ sectionKey, key, type, input });
    }
  }

  builtInThemeSelect.innerHTML = builtInThemeOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
  builtInThemeSelect.value = selectedBuiltInThemeKey;
  builtInThemeSelect.addEventListener("change", () => {
    selectedBuiltInThemeKey = builtInThemeSelect.value;
    loadTheme(cloneTheme(builtInThemes[selectedBuiltInThemeKey]), "Loaded built-in theme.");
  });

  resetButton.addEventListener("click", () => {
    loadTheme(cloneTheme(builtInThemes[selectedBuiltInThemeKey]), "Reset to selected built-in theme.");
  });

  nameInput.addEventListener("input", () => {
    currentTheme.metadata.name = nameInput.value;
    updatePreview();
  });

  descriptionInput.addEventListener("input", () => {
    currentTheme.metadata.description = descriptionInput.value;
    updatePreview();
  });

  applyImportButton.addEventListener("click", () => {
    const result = api.importThemeDraftJson(importText.value);
    if (result.errors.length > 0 || result.theme == null) {
      importError = result.errors.join(" ");
      statusMessage = "";
      updateStatus();
      return;
    }

    importError = "";
    loadTheme(cloneTheme(result.theme), "Imported theme draft.");
  });

  copyExportButton.addEventListener("click", async () => {
    try {
      if (navigator.clipboard != null) {
        await navigator.clipboard.writeText(exportText.value);
      } else {
        exportText.select();
        document.execCommand("copy");
      }
      statusMessage = "Copied export JSON.";
      updateStatus();
    } catch (error) {
      importError = error instanceof Error ? error.message : "Copy failed.";
      updateStatus();
    }
  });

  buildSection("#vi-color-section", "color", colorFields);
  buildSection("#vi-size-section", "size", sizeFields);
  buildSection("#vi-typography-section", "typography", typographyFields);
  buildSection("#vi-motion-section", "motion", motionFields);
  populateFormValues();
  importText.value = api.exportThemeDraftJson(currentTheme);
  updatePreview();

  function loadTheme(theme, message) {
    currentTheme = theme;
    statusMessage = message;
    importError = "";
    populateFormValues();
    updatePreview();
  }

  function populateFormValues() {
    nameInput.value = currentTheme.metadata.name;
    descriptionInput.value = currentTheme.metadata.description ?? "";
    for (const field of fieldRegistry) {
      const value = currentTheme[field.sectionKey][field.key];
      if (field.type === "checkbox") {
        field.input.checked = Boolean(value);
      } else {
        field.input.value = String(value ?? "");
      }
    }
  }

  function updatePreview() {
    const validationErrors = api.validateThemeDraft(currentTheme);
    importError = validationErrors.join(" ");
    exportText.value = api.exportThemeDraftJson(currentTheme);
    activeThemeLabel.textContent = `Active draft: ${currentTheme.metadata.name}`;
    updateStatus();
    renderScenarios();
  }

  function updateStatus() {
    if (importError.length > 0) {
      statusEl.textContent = importError;
      statusEl.className = "vi-status vi-error";
      return;
    }

    statusEl.textContent = statusMessage;
    statusEl.className = "vi-status";
  }

  function renderScenarios() {
    const scenarios = createScenarios();
    scenariosEl.replaceChildren();
    for (const scenario of scenarios) {
      const article = document.createElement("article");
      article.className = "vi-card";
      const heading = document.createElement("h3");
      heading.textContent = scenario.title;
      const description = document.createElement("p");
      description.textContent = scenario.description;
      const frame = document.createElement("div");
      frame.className = "vi-svg-frame";
      frame.innerHTML = api.renderSnapshotToSvg(scenario.snapshot, {
        width: scenario.width,
        height: scenario.height,
        nodeWidth: scenario.nodeWidth,
        nodeHeight: scenario.nodeHeight,
        theme: currentTheme,
        visualState: scenario.visualState,
      });
      article.append(heading, description, frame);
      scenariosEl.appendChild(article);
    }
  }

  function createScenarios() {
    return [
      {
        title: "1. Small linear dataflow",
        description: "Baseline spacing, labels, and one metadata line for calm technical readability.",
        width: 360,
        height: 220,
        nodeWidth: 150,
        nodeHeight: 58,
        snapshot: {
          version: 1,
          nodes: [
            node("ingest", "Ingest", "gateway", { subtitle: "accepts batch" }),
            node("validate", "Validate", "service", { subtitle: "rules engine" }),
            node("store", "Store", "datastore", { subtitle: "writes journal" }),
            node("notify", "Notify", "queue", { subtitle: "emits events" }),
          ],
          edges: [
            edge("e1", "ingest", "validate", "routes"),
            edge("e2", "validate", "store", "persists"),
            edge("e3", "store", "notify", "publishes"),
          ],
        },
        visualState: {
          nodeAnnotations: { store: "Metadata sample" },
        },
      },
      {
        title: "2. Branching dataflow",
        description: "Fan-out, fan-in, and one highlighted path for routing balance and edge emphasis.",
        width: 360,
        height: 220,
        nodeWidth: 148,
        nodeHeight: 58,
        snapshot: {
          version: 1,
          nodes: [
            node("api", "API Gateway", "gateway"),
            node("orders", "Orders", "service"),
            node("inventory", "Inventory", "service"),
            node("settle", "Settlement", "service"),
            node("bus", "Event Bus", "queue"),
          ],
          edges: [
            edge("e1", "api", "orders", "routes"),
            edge("e2", "api", "inventory", "routes"),
            edge("e3", "orders", "settle", "charges"),
            edge("e4", "inventory", "settle", "reserves"),
            edge("e5", "settle", "bus", "emits"),
          ],
        },
        visualState: {
          highlightedEdgeIds: ["e2", "e4", "e5"],
        },
      },
      {
        title: "3. Grouped subsystem",
        description: "Group boundaries, labels, and boundary-crossing edges for subsystem hierarchy.",
        width: 360,
        height: 220,
        nodeWidth: 148,
        nodeHeight: 58,
        snapshot: {
          version: 1,
          nodes: [
            node("frontdoor", "Front Door", "gateway"),
            node("planner", "Planner", "service"),
            node("executor", "Executor", "service"),
            node("warehouse", "Warehouse DB", "datastore"),
            node("audit", "Audit Log", "queue"),
          ],
          edges: [
            edge("e1", "frontdoor", "planner", "routes"),
            edge("e2", "planner", "executor", "dispatches"),
            edge("e3", "executor", "warehouse", "reads"),
            edge("e4", "executor", "audit", "records"),
          ],
          groups: [
            group("g1", "Application Tier", ["frontdoor", "planner", "executor"]),
            group("g2", "Storage Tier", ["warehouse", "audit"]),
          ],
        },
        visualState: {},
      },
      {
        title: "4. Dense graph with search result",
        description: "Matched nodes stay prominent while non-matching nodes are de-emphasized without disappearing.",
        width: 360,
        height: 240,
        nodeWidth: 138,
        nodeHeight: 56,
        snapshot: {
          version: 1,
          nodes: Array.from({ length: 9 }, (_, index) =>
            node(`n${index + 1}`, `Node ${index + 1}`, index % 4 === 0 ? "gateway" : index % 3 === 0 ? "datastore" : "service", {
              subtitle: index === 3 || index === 6 ? "search hit" : "context",
            }),
          ),
          edges: [
            edge("e1", "n1", "n2"), edge("e2", "n1", "n3"), edge("e3", "n2", "n4"), edge("e4", "n3", "n5"), edge("e5", "n4", "n6"), edge("e6", "n5", "n6"), edge("e7", "n6", "n7"), edge("e8", "n6", "n8"), edge("e9", "n8", "n9"),
          ],
        },
        visualState: {
          searchMatchNodeIds: ["n4", "n7"],
          dimmedNodeIds: ["n1", "n2", "n3", "n5", "n6", "n8", "n9"],
        },
      },
      {
        title: "5. Selected node with dependency context",
        description: "Selection outline, focus ring, and upstream/downstream highlighting share the same token set.",
        width: 360,
        height: 220,
        nodeWidth: 148,
        nodeHeight: 58,
        snapshot: {
          version: 1,
          nodes: [
            node("source", "Source", "gateway"),
            node("normalize", "Normalize", "service"),
            node("enrich", "Enrich", "service"),
            node("rank", "Rank", "service"),
            node("export", "Export", "queue"),
          ],
          edges: [
            edge("e1", "source", "normalize"),
            edge("e2", "normalize", "enrich"),
            edge("e3", "enrich", "rank"),
            edge("e4", "rank", "export"),
          ],
        },
        visualState: {
          selectedNodeIds: ["enrich"],
          focusedNodeIds: ["enrich"],
          upstreamHighlightedNodeIds: ["source", "normalize"],
          downstreamHighlightedNodeIds: ["rank", "export"],
          highlightedEdgeIds: ["e1", "e2", "e3", "e4"],
        },
      },
      {
        title: "6. Incremental update state",
        description: "Added, changed, removed, moved, relayouted, and stale markers stay legible without snapshot noise.",
        width: 360,
        height: 240,
        nodeWidth: 146,
        nodeHeight: 58,
        snapshot: {
          version: 1,
          nodes: [
            node("new-node", "New Worker", "service", { subtitle: "added" }),
            node("changed-node", "Coordinator", "gateway", { subtitle: "changed" }),
            node("removed-node", "Legacy Path", "service", { subtitle: "removed" }),
            node("moved-node", "Cache", "datastore", { subtitle: "moved" }),
            node("stale-node", "Stale Replica", "datastore", { subtitle: "stale" }),
            node("relayouted-node", "Rebalanced", "queue", { subtitle: "relayouted" }),
          ],
          edges: [
            edge("e1", "new-node", "changed-node"),
            edge("e2", "changed-node", "removed-node"),
            edge("e3", "changed-node", "moved-node"),
            edge("e4", "moved-node", "stale-node"),
            edge("e5", "stale-node", "relayouted-node"),
          ],
        },
        visualState: {
          nodeChangeStates: {
            "new-node": "added",
            "changed-node": "changed",
            "removed-node": "removed",
            "moved-node": "moved",
            "stale-node": "stale",
            "relayouted-node": "relayouted",
          },
          edgeChangeStates: {
            e2: "removed",
            e3: "changed",
            e5: "stale",
          },
          nodeAnnotations: {
            "removed-node": "Ghosted state",
          },
        },
      },
      {
        title: "7. Warning and error annotations",
        description: "Diagnostic markers stand out without overwhelming nearby normal content.",
        width: 360,
        height: 220,
        nodeWidth: 150,
        nodeHeight: 58,
        snapshot: {
          version: 1,
          nodes: [
            node("collector", "Collector", "service"),
            node("validator", "Validator", "service"),
            node("store-a", "Primary Store", "datastore"),
            node("store-b", "Replica Store", "datastore"),
          ],
          edges: [
            edge("e1", "collector", "validator"),
            edge("e2", "validator", "store-a"),
            edge("e3", "validator", "store-b"),
          ],
        },
        visualState: {
          nodeDiagnosticStates: {
            validator: "warning",
            "store-b": "error",
          },
          nodeAnnotations: {
            validator: "Retry budget low",
            "store-b": "Replication paused",
          },
        },
      },
      {
        title: "8. Dark mode rendering",
        description: "Use the built-in dark draft to confirm there are no accidental light-surface assumptions.",
        width: 360,
        height: 220,
        nodeWidth: 148,
        nodeHeight: 58,
        snapshot: {
          version: 1,
          nodes: [
            node("search", "Search", "gateway"),
            node("ranker", "Ranker", "service"),
            node("profile", "Profile Store", "datastore"),
            node("events", "Live Events", "queue"),
          ],
          edges: [
            edge("e1", "search", "ranker", "dispatches"),
            edge("e2", "ranker", "profile", "reads"),
            edge("e3", "ranker", "events", "emits"),
          ],
        },
        visualState: {
          selectedNodeIds: ["ranker"],
          searchMatchNodeIds: ["profile"],
        },
      },
      {
        title: "9. High-contrast rendering",
        description: "Use the high-contrast draft to verify focus, selection, and diagnostics remain distinguishable.",
        width: 360,
        height: 220,
        nodeWidth: 148,
        nodeHeight: 58,
        snapshot: {
          version: 1,
          nodes: [
            node("scan", "Scan", "gateway"),
            node("triage", "Triage", "service"),
            node("queue", "Review Queue", "queue"),
            node("archive", "Archive", "datastore"),
          ],
          edges: [
            edge("e1", "scan", "triage"),
            edge("e2", "triage", "queue"),
            edge("e3", "triage", "archive"),
          ],
        },
        visualState: {
          selectedNodeIds: ["triage"],
          focusedNodeIds: ["triage"],
          nodeDiagnosticStates: { archive: "warning" },
          nodeAnnotations: { archive: "Contrast checkpoint" },
        },
      },
    ];
  }

  function node(id, label, kind, metadata = undefined) {
    return metadata == null ? { id, label, kind } : { id, label, kind, metadata };
  }

  function edge(id, sourceId, targetId, label = undefined) {
    return label == null ? { id, sourceId, targetId } : { id, sourceId, targetId, label };
  }

  function group(id, label, childNodeIds) {
    return { id, label, kind: "group", childNodeIds };
  }

  function cloneTheme(theme) {
    return JSON.parse(JSON.stringify(theme));
  }
})();
