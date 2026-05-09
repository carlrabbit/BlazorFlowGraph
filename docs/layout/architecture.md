# Layout Architecture

The layout package integrates with ELK (Eclipse Layout Kernel) to provide automatic graph layout.

## Current Implementation

A simple grid layout is provided as a placeholder. Replace with ELK for production use.

## ELK Integration (Planned)

```typescript
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();
const layout = await elk.layout(elkGraph);
```

## Layout Options

- `algorithm`: ELK algorithm identifier (e.g. `layered`, `force`, `mrtree`)
- `nodeWidth` / `nodeHeight`: Default node dimensions
- `spacing`: Padding between nodes
