# Stackline

**Learn system design by watching it run.** Live site: https://rkparupudi.github.io/stackline/

Stackline is two short-lesson courses where every idea is an animated, running system:

- **System design** (30 lessons, 5 modules): foundations, data at scale, services and communication, reliability, and 7 classic case studies.
- **AI agent design** (7 lessons, 3 modules): the agent loop, RAG, multi-agent orchestration, MCP and tool gateways, agent state, guardrails, and how classic patterns apply to agents.

Each lesson has:

1. A one-line takeaway.
2. An animation with play/pause, step back/forward and speed controls, plus captions synced to each step.
3. Key ideas, real-world examples, trade-offs and an interview tip.
4. A live lab where one fits (load balancer, hash ring, rate limiter, circuit breaker, estimation calculator).
5. A short quiz with explanations, and “mark complete” progress saved in the browser.

Also: search (Ctrl/Cmd + K or `/`), arrow-key navigation between lessons, and an Auto / Light / Dark theme (Auto is light from 6:00 to 18:00 local time, dark otherwise).

## Project layout

```
index.html            app shell
css/style.css         styles (light + dark)
js/engine.js          SVG animation engine
js/content.js         original lessons (animations + text)
js/content-extra.js   newer lessons, quizzes, course structure
js/labs.js            interactive labs
js/app.js             routing, course/lesson views, quiz, progress, search, theme
```

No build step. Open `index.html`, or serve the folder with `python3 -m http.server`.

## Notes

The diagrams are simplified teaching models. Product names are examples of where each idea shows up; check specifics against current documentation.
