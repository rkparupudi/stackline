# Stackline

**Learn system design by watching it run.**

Stackline is an animated guide to system design, in two tracks:

**System design** (`index.html`)

- **Animated topics:** building blocks (load balancer, caching, CDN, replication, sharding, message queues), distributed concepts (CAP, consistent hashing, rate limiting, Raft leader election), case studies (URL shortener, chat, news feed, ride-hailing, video streaming, payments, autocomplete) and resilience patterns (circuit breaker, retries with backoff, bulkhead, saga).

**AI agent design** (`agents.html`)

- The agent loop (tool use), RAG, multi-agent orchestration, tool access via MCP and gateways, guardrails and human-in-the-loop, and agent state / durable execution.
- How classic patterns (queues, idempotency, circuit breakers, rate limits) apply to agents.

**Both tracks include:**
- **Step-synced captions:** click any step to jump the animation to that moment.
- **Live labs:** break a load balancer, resize a hash ring, flood a rate limiter, trip a circuit breaker.
- **Back-of-the-envelope calculator,** with the arithmetic shown.
- **Quick-pick cheat sheet:** problem → pattern → what to watch out for.

## Run locally

Static files with no build step (`style.css` and `app.js` are shared by both pages). Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server
```

## Notes

The diagrams are simplified teaching models. Product names are examples of where each idea shows up; check specifics against current documentation.
