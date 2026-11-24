---
title: Dor and Transformer Lab
privacy: public_portfolio_safe
---

# Dor and Transformer Lab

## Dor

Dor is a real-time agentic news globe, a team project by Haider Abbas, Nikhil Gaurav and Ankit Ojha. Individual ownership is not documented separately. Specialized Go agents on NATS JetStream ingest, normalize, locate, classify, embed and cluster news reports. A separate relation judge assesses possible links between distinct stories. The SolidJS and MapLibre interface connects globe, news wire and original sources. PostgreSQL and pgvector support storage and retrieval. Model enrichment uses Jev and configured alternatives or deterministic fallback paths.

The product question is whether geography helps readers investigate events and connections without hiding sources or uncertainty. Same-event clustering is different from relating distinct stories. A predicted relationship is not proof of causation. Approximate placements and uncertain links remain limitations.

A bounded November 22, 2026 live-data run persisted 103 fresh articles and passed six core browser journeys. Most later items took deterministic fallbacks after throttling. These are dated functional observations, not accuracy certification, sustained reliability or measured reader benefit. External alerts need separate demonstration. Source: https://github.com/ankojh/dor. Portfolio: /work/dor.

## Transformer Lab

Transformer Lab is Ankit's independent interactive transformer explainer and editable experiment lab. A ten-stage story follows a sentence through tokenization, embeddings, positional information, attention, heads, MLP, stacked blocks, next-token output and a small training example. The TypeScript/React app runs hand-written inference in a Web Worker. The story uses committed model traces while optional live GPT-2 small weights load. Live GPT-2 requires approximately 249 MB of model weights. The default Tiny lab works without that GPT-2 download.

The Lab exposes equations and tensor values with activation/weight editing, head ablation, structural switches and before/after predictions. Tiny intermediate tensors are checked against PyTorch fixtures within 2e-4. This demonstrates numerical implementation parity, not prediction accuracy or learning effectiveness. Learning outcomes have not yet been measured. Source: https://github.com/ankojh/transformer. Portfolio: /work/transformer.
