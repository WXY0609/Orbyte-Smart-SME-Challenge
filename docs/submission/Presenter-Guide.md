# Orbyte Presenter Guide · Team Allstar

主讲页为 1–10，11–12 为评委提问时使用的附录。PPT 内也包含英文讲者备注和中文提示。没有固定演讲时长，可按比赛要求删减。

团队：Phan Yi Yan, Lim Jia Vei, Chin Yi Shen, Lee Wing Ho, Wong Xing You。

第 9 页的 5 家餐厅、2 周及 RM 49.00 / 店 / 月均为本稿建议的实验设定，尚未启动或验证，可在 PowerPoint 中编辑。

## 01 · Orbyte

EN: Imagine tomorrow's afternoon service. Rain threatens your outdoor tables, indoor seating is full, and the front pickup point is closed. Orbyte helps a restaurant owner check which backup plan fits the known conditions, confirm what is missing, and approve a concrete next step. We are Team Allstar.
中文提示：先用餐厅老板的情境开场，再介绍队名。
Scope: Restaurant SME MVP. Do not describe a validated commercial product or promise that a checked plan will succeed.
Sources: project README.md and implemented React/Flask application, inspected 25 October 2026.

## 02 · Tomorrow’s operational blind spots

EN: Weather alerts and local notices tell an owner what might happen. The owner still has to relate each event to opening hours, capacity, entrances and delivery arrangements. A fallback can fail because another condition blocks it. Our starting users are independent restaurants and cafés with outdoor seating or pickup operations. This is the problem hypothesis behind the MVP, not the result of completed merchant research.
中文提示：强调“知道事件”和“找到可执行方案”之间仍有判断工作。
Source: user problem statement and implemented business profile fields. No market statistics or interview results are claimed.

## 03 · One readiness workflow

EN: Orbyte brings tomorrow's events together with the saved business profile. It checks alternative plans, turns a missing condition into a confirmation question, and keeps the owner responsible for approving the action. The same record then tracks execution and completion. The workflow links the initial evidence to the final preparation task.
中文提示：按发现、检查、确认、批准、追踪讲一遍，不要逐个介绍七个导航。
Source: README.md, server.py routes and current local demo screenshot. Local screenshot captured 25 October 2026, using simulated events for 26 October.

## 04 · A backup plan can have its own conflict

EN: Here is our core scenario. The selected service is tomorrow from two to five in the afternoon. Rain affects sixteen outdoor seats. Moving guests indoors conflicts with the saved booking count: all forty indoor seats are taken. Front pickup conflicts with an overlapping closure. Rear pickup stays at insufficient data because access for tomorrow is unknown. The rule engine reports these states and the evidence behind them. It prioritizes known conflicts and ignores events outside the service window.
中文提示：这是核心差异，放慢讲三个判断以及理由。
Source: domain.py evaluate(), initial_state(True), server.py /api/checks. All figures are seeded demonstration conditions, not actual restaurant results.

## 05 · A recent observation needs a future check

EN: When rear access is unknown, the owner can share a short voluntary question. Customers choose yes, no, not sure or skip, with an observation time and no required personal details. A no-blockage answer tells us what the customer saw recently. It does not establish tomorrow's access. The owner must check the target service window and record that verification before the rear plan can become conditions met. Conflicting answers remain unresolved until an owner check.
中文提示：顾客问的是“有没有堵住”。选择 No 表示没有看到堵塞，不是“后门不能用”。强调今天的线索不能自动成为明天的事实。
Source: PublicFeedback.jsx, server.py /public/questions/.../responses and /questions/.../verify, domain.py rules. Screenshot is an actual voluntary demo question.

## 06 · The owner approves the exact action

EN: Once the rear plan meets the known conditions, the owner can prepare a pickup task. This example records the team, service window, instructions and an estimated cost of RM twenty. Approval saves the owner's display name, time and content snapshot. Execution is a separate step, and the owner records the completion note. If relevant conditions change before execution, the action needs review and approval again. External notices are simulated in this MVP.
中文提示：RM20 只是演示中的老板预计成本，不是节省金额，也不是订阅价格。说明批准和执行是两个步骤。
Sources: server.py action transition endpoints, domain.py changed(), screenshot action-approved.png. No real customer notification is sent.

## 07 · AI Copilot explains and prepares

EN: The Copilot is a real OpenRouter integration. Every turn reloads the current store context. It can read events and checks, test temporary assumptions, inspect confirmations and tasks, and create question or action drafts. The backend validates tool arguments and verifies the record references returned to the owner. The model explains the rules' results. It has no tools to approve, execute, verify access or complete a task. Assumptions in a conversation do not overwrite saved business facts.
中文提示：清楚说真实模型调用，不是写死的聊天。模型负责解释，规则负责状态，老板负责批准。
Sources: copilot.py tool allowlist and loop, server.py chat endpoint. Screenshot captures a successful deployed OpenRouter conversation on 24 October 2026. The model shown is one free-route selection, not a promised fixed model. Relevant context is sent to OpenRouter when the owner submits a chat.

## 08 · A working MVP with a tested decision flow

EN: We have a deployed demo and a local installation. The implemented stack is React, Flask and SQLite. Automated checks cover the rule and API workflow, plus currency and Malaysian time formatting. We also exercised the deployed feedback, verification, approval and completion journey, and a real AI reply. These are technical validation results. We have not yet measured merchant time saved, revenue protection or customer adoption.
中文提示：用“已完成、已测通”证明完成度，不把技术测试数量讲成商业效果。
Sources: test_app.py contains 35 tests in the last verified run, src/lib.test.js contains 3 tests. Previous deployment verification and actual screenshots. This is engineering evidence, not merchant outcome evidence.

## 09 · A focused restaurant pilot

EN: Our next step is a proposed pilot with five restaurants over two weeks. We would measure preparation time, unresolved conditions and whether approved tasks finish before service. We would also ask which alerts matter and whether the owner would pay. An initial pricing hypothesis is RM forty-nine per store per month, subject to merchant feedback and hosting and AI costs. No pilot partner, revenue or commercial pricing has been validated yet.
中文提示：所有数字都是下一步实验设定。没有签约用户、收入或已验证定价。若评委追问市场规模，先说明尚未做市场测算。
Source: Team Allstar proposed validation plan for this pitch. This slide contains explicitly labeled hypotheses, not existing traction.

## 10 · Orbyte by Team Allstar

EN: Orbyte gives restaurant owners a way to check tomorrow's plan, resolve the missing conditions and approve the preparation. Our next step is a small restaurant pilot with real operational feedback. You can explore the online demo using the link on screen. The public website contains simulated business data, and its free hosting may need a short wake-up period. Thank you.
中文提示：结尾邀请评委试用，说明期待餐厅试点与产品反馈。
Demo: https://orbyte-readiness-demo.onrender.com
Repository: https://github.com/WXY0609/Orbyte-Smart-SME-Challenge (private; not a public access link).
Public demo uses anonymous browser workspaces and ephemeral storage. Live operational data is available only in the local installation.

## 11 · Architecture and responsibility

EN: React presents the workflow. Flask owns validation, rule evaluation, approvals and execution transitions. SQLite persists state and conversations. Open-Meteo supplies tomorrow's weather in the local Live workspace. OpenRouter receives the relevant business context and invokes an allowlist of backend tools. The free hosted demo isolates anonymous browser workspaces and limits AI attempts. This is not an authenticated production merchant system.
中文提示：评委问“为什么不直接用 ChatGPT”时，解释结构化资料、确定性规则、验证和批准状态机的作用。
Sources: server.py, domain.py, storage.py, copilot.py, Dockerfile and render.yaml. Official provider documentation: https://openrouter.ai/docs/guides/features/tool-calling and https://open-meteo.com/en/docs.

## 12 · MVP scope and next steps

EN: Today, the public website is a synthetic demo with separate browser workspaces. Its free hosting may sleep and erase records, and the AI allowance is three attempts per network and twelve globally each Malaysian day while the counters persist. The local Live workspace can fetch real weather and use merchant-entered notices. Next, owner authentication and durable records and quota counters are prerequisites for real merchant deployment. Official notice integrations, real messaging and additional stores are future work.
中文提示：不要说公开网站已经支持真实店铺运营，也不要说通知已经真的发出。主动区分演示版和正式运营版。
Sources: README.md, render.yaml and server.py. Free service behavior: https://render.com/docs/free. Roadmap items are planned, not implemented.

## Judge Q&A

**How is this different from asking a general chatbot?**
Orbyte stores structured business conditions and evaluates plans with backend rules. It links explanations to records and enforces approval and execution states. The model does not decide the condition status.

**What is the core innovation?**
The MVP checks whether a response to one disruption conflicts with other known constraints, then uses a specific confirmation question to resolve a missing condition. The owner verifies future applicability before the rule result changes.

**Are all event feeds live?**
No. The local Live workspace fetches Open-Meteo weather. Closures, utilities and activities are merchant-entered or explicitly simulated. The public website runs the isolated simulated scenario.

**Can customers mislead the AI?**
Customer observations remain unverified data. They cannot authorize actions, change system instructions or establish tomorrow's access. Owner verification, backend validation and restricted model tools set the boundaries. The MVP still needs real-world abuse evaluation.

**What does “conditions met” promise?**
Only that no conflict was found in the known conditions for the selected window. It does not guarantee successful or safe operations.

**Is the public demo ready for real merchants?**
No. It has anonymous browser separation rather than owner accounts. Free hosting can reset its SQLite records and quota counters. Authentication and durable storage are next steps before production merchant use.

**Have you proved time savings or revenue impact?**
No. We have technical test results and a working workflow. Preparation time, unresolved conditions, task completion and willingness to pay are proposed pilot measurements.

**Does the app really send notices?**
External notifications are simulated. Internal preparation tasks can be created and tracked, with owner approval and completion notes.

**Does the AI need its own key for every visitor?**
The hosted demo uses a backend-only OpenRouter key and shared limits. It does not send the key to the browser. Free-provider availability and latency vary.

**What would you build next?**
Owner authentication, durable storage and usage counters, then merchant validation and selected official event integrations. Real messaging and more stores follow only after that foundation.
