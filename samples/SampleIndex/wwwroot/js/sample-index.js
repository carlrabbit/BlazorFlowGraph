(() => {
  function normalizePath(path) {
    if (!path || path.trim() === "") {
      return "/";
    }

    return path.startsWith("/") ? path : `/${path}`;
  }

  function createSampleUrl(port, path) {
    const current = new URL(window.location.href);
    const normalizedPath = normalizePath(path);

    if (current.hostname === "localhost" || current.hostname === "127.0.0.1") {
      return `${current.protocol}//${current.hostname}:${port}${normalizedPath}`;
    }

    // Handles forwarded host forms like app-5100.github.dev and repo-5100-preview.github.dev.
    const replacedHost = current.hostname.replace(/(^|-)\d+(?=-|\.|$)/, `$1${port}`);
    if (replacedHost !== current.hostname) {
      return `${current.protocol}//${replacedHost}${normalizedPath}`;
    }

    return `${current.protocol}//${current.hostname}:${port}${normalizedPath}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderSamples(samples) {
    const tableBody = document.getElementById("sample-table-body");
    if (!tableBody) {
      return;
    }

    tableBody.innerHTML = "";

    for (const sample of samples) {
      const row = document.createElement("tr");
      const url = createSampleUrl(sample.port, sample.path);
      row.innerHTML = [
        `<td>${escapeHtml(sample.name)}</td>`,
        `<td>${escapeHtml(sample.description)}</td>`,
        `<td><code>${escapeHtml(sample.projectPath)}</code></td>`,
        `<td><code>${escapeHtml(sample.port)}</code></td>`,
        `<td><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a></td>`,
      ].join("");
      tableBody.appendChild(row);
    }
  }

  function renderError(message) {
    const errorElement = document.getElementById("sample-index-error");
    const tableBody = document.getElementById("sample-table-body");
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="5">Unable to load sample registry.</td></tr>';
    }

    if (errorElement) {
      errorElement.hidden = false;
      errorElement.textContent = message;
    }
  }

  async function loadRegistry() {
    try {
      const response = await fetch("/SAMPLES.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Registry request failed with status ${response.status}.`);
      }

      const payload = await response.json();
      if (!payload || !Array.isArray(payload.samples)) {
        throw new Error("Registry payload must contain a 'samples' array.");
      }

      renderSamples(payload.samples);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error while loading sample registry.";
      renderError(message);
    }
  }

  window.BlazorFlowGraphSampleIndex = {
    createSampleUrl,
  };

  loadRegistry();
})();
