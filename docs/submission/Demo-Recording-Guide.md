# Orbyte Demo Video · Team Allstar

目标成片：3 分钟，英文旁白，中文操作提示。此文件是录制稿和分镜，不是已录好的视频。

团队：Phan Yi Yan, Lim Jia Vei, Chin Yi Shen, Lee Wing Ho, Wong Xing You。

网站：https://orbyte-readiness-demo.onrender.com

## 录制前准备

1. 提前打开网站，让免费服务完成唤醒。使用电脑横屏，建议 1920×1080，浏览器缩放保持文字清楚，关闭通知。
2. 只使用 **Demo scenario** 和模拟资料。公开网站的 **Live workspace** 不可用，录制不需要切换 Live。
3. 在你用于录制的演示工作区点击 **Reset demo**，回到 **Tomorrow Overview**。这会清空该浏览器的演示记录和对话。不要在保存了重要演示内容的浏览器里重置。
4. 确认目标日期是 **明天**，时段为 **14:00–17:00 MYT**。跨过马来西亚午夜后需要重新准备，画面中的日期以实际录制当天为准。
5. 确认初始状态：室内 40 席全部订满，户外 16 席，前门封路，后门未知。天气和封路是明确标注的模拟数据。
6. 先熟悉所有按钮。建议按下面镜头分段录制，再剪成 180 秒，不必一镜到底。AI 请求的等待时间可以剪短，并标明 “AI processing time shortened”。
7. 公开 Demo 的 AI 默认为每个网络每日 3 次、全站每日 12 次尝试。先完成普通流程，再录一次 AI 即可。新对话或 Reset demo 不会恢复额度。不要为排练反复发送。
8. 录制范围只包含产品网页。不要展示 `.env`、Render 环境变量、密码或 GitHub 授权页。

## 3 分钟分镜与旁白

时间轴是剪辑目标，允许镜头中短暂停留。英文旁白约 330 词，建议以自然速度读，先试录一次再微调停顿。

### 00:00–00:18 · 开场 / Tomorrow Overview

**操作：** 停留在 Tomorrow Overview，展示 Orbyte 名称和明日营业时段。

**English voice-over:**

> Meet Orbyte, Team Allstar's tomorrow business readiness assistant for restaurant SMEs. This demonstration uses simulated events. We will check the alternatives, confirm missing information, and turn an owner-approved plan into a completed preparation task.

**屏幕字幕：** `Orbyte by Team Allstar` / `Simulated restaurant scenario`

### 00:18–00:45 · 互相限制的应对方案 / Plan Checks

**操作：** 点击 **Plan Checks**。缓慢展示室内、前门、后门三张检查结果，可滚动，但不要逐个点开所有依据。

**English voice-over:**

> Tomorrow afternoon, rain may affect sixteen outdoor seats. Moving guests indoors conflicts with the saved bookings: all forty indoor seats are taken. Front-door pickup also conflicts with an overlapping road closure. Rear-door pickup remains uncertain because tomorrow's access has not been confirmed. Each result shows its supporting records.

**屏幕字幕：** `Indoor: conflict` / `Front pickup: conflict` / `Rear pickup: insufficient data`

### 00:45–01:10 · 简短自愿问题 / Customer feedback

**操作：** 在后门方案点击 **Create confirmation question**，系统进入 **Confirmations**。点击 **Open customer feedback page**。顾客页选择 **No — I did not see a blockage**，保持默认的当前观察时间，点击 **Submit observation**。

**English voice-over:**

> Orbyte helps the owner ask a short, voluntary question: was the rear passage blocked? A customer selects no and submits an observation time. No personal details are required. This answer becomes an unverified lead. What someone saw today does not establish what will be available tomorrow.

**屏幕字幕：** `Customer observation = unverified lead`

**注意：** 问题问的是“有没有堵塞”。**No** 表示“没有看到堵塞”，不是“后门不可以使用”。

### 01:10–01:35 · 老板核实明日时段 / Owner verification

**操作：** 切回老板的 **Confirmations** 页，点击刷新图标，展示回答的观察和提交时间。在老板核实表单选择 **Confirmed usable**，粘贴下面的演示核实说明，点击 **Record owner check & recheck plans**。进入 **Plan Checks**，展示后门更新为 **Known conditions met**。

**演示核实说明，可直接粘贴：**

```text
Demo owner checked tomorrow's works schedule with building management and confirmed the rear passage is usable from 14:00 to 17:00.
```

**English voice-over:**

> The owner separately checks the works schedule for tomorrow's service window and records that rear access is usable. The rear plan now meets the known conditions. Indoor capacity and front access still conflict. The system updates the affected option while keeping the remaining constraints visible.

**屏幕字幕：** `Owner verification for tomorrow's service` / `Known conditions met`

**注意：** 这是模拟老板核实，不要声称真实联系过物业。条件满足也不代表保证成功。

### 01:35–02:00 · 明确行动和批准 / Actions

**操作：** 在后门方案点击 **Prepare action draft**。保留 **Internal preparation task**，预计成本填 **20**（RM），粘贴下面内容，点击 **Save draft for review**。展示对象、负责人、营业时段、预计成本，随后点击 **Approve this action**。

**任务内容，可直接粘贴：**

```text
Set up rear-door pickup signage and brief the restaurant team before tomorrow's 14:00–17:00 service. Keep the passage clear.
```

**English voice-over:**

> The owner prepares a rear-pickup task with exact instructions, a responsible person, a service window and an estimated cost of RM twenty. Approval records the owner's name, time and content snapshot. The estimate belongs to the owner; it is not a claimed saving.

**屏幕字幕：** `Draft reviewed by owner` / `Estimated cost: RM 20.00`

### 02:00–02:20 · 执行与完成 / Preparation tracking

**操作：** 点击 **Start preparation task**。在 **Completion note** 输入下面内容，再点击 **Record & mark completed**。停留在 **Completed** 和批准记录上。

**完成备注，可直接粘贴：**

```text
Rear pickup signage is in place and the restaurant team has completed the briefing. Demo task completed.
```

**English voice-over:**

> Approval and execution are separate steps. We start the preparation, record the completion note, and mark it complete. If relevant conditions change before execution, the action needs another review and approval. External notification sending remains simulated in this MVP.

**屏幕字幕：** `Approved` / `In progress` / `Completed`

### 02:20–02:50 · 真实 AI Copilot

**操作：** 进入 **AI Copilot**，只发送一次下面的问题。保留处理中画面约 2 秒，剪短多余等待。回复出现后展示解释和依据链接。模型措辞和是否调用工具可能变化，不要要求每次返回一模一样的文字。

**AI prompt，可直接粘贴：**

```text
Which risks remain, and which preparation tasks are complete? Keep your answer under 100 words and cite the relevant records.
```

**English voice-over:**

> The real OpenRouter Copilot reloads the latest business context. It can explain the remaining constraints, inspect tasks and prepare drafts, with links to verified records. Temporary assumptions do not overwrite saved facts. The model has no tools to approve actions, verify access or complete tasks. Those decisions stay with the owner.

**屏幕字幕：** `Real OpenRouter integration` / `AI prepares. Owner approves.`

### 02:50–03:00 · 收尾

**操作：** 回到 Tomorrow Overview 或停留在有真实回复的 Copilot。最后放产品名称、队名和网站链接。

**English voice-over:**

> Orbyte connects tomorrow's risks to checked preparation. Built by Team Allstar. Explore the demo, and help us test it with restaurant owners.

**屏幕字幕：** `Orbyte · Team Allstar` / `orbyte-readiness-demo.onrender.com`

## AI 或网络异常时的备用镜头

- **AI 等待较长：** 分段录制，等待真实回复后再录回复镜头，剪辑时标注等待时间已缩短。
- **AI 已限额或供应商不可用：** 可以插入 `assets/copilot-real.png` 的已验证真实回复截图。画面必须标注 `Previously captured real AI response`，旁白改为：

> This previously captured response shows a successful OpenRouter conversation. The live service can be limited by the free provider. The rule checks and owner approval workflow remain available independently.

- 这张历史 AI 截图来自 2026-10-24 的初始场景，当时后门尚未核实。它与本次“任务已经完成”的最终状态不同，**不要把截图解释成当前任务完成后的回答**。若使用该备用镜头，可将 AI 段提前到老板核实之前，或明确说明它展示的是初始场景。
- **免费服务休眠：** 在正式录制前提前唤醒。不要把 Render 的唤醒页当产品错误。
- **反馈链接失效或日期过期：** 回到自己的工作区重置演示，重新创建问题，并从头录这一段。
- **全程网络不稳：** 按项目 README 启动本地版本，录制相同的 Demo scenario。开始时标注 `Local MVP demo`，真实 AI 仍需要后端 OpenRouter 配置。

## 剪辑与交付建议

- 总长 180 秒，约 8 个镜头。不需要逐个介绍七个导航页。
- 使用短停顿、普通硬切和适度鼠标移动。保留模拟数据标记和条件状态。
- 旁白可单独录，再对齐操作画面。最终提交前检查字幕、声音、网址和日期。
- 不要说已经自动发送邮件、WhatsApp 或短信。不要说已经获得商家用户、节省金额或营业增长。
- 已采集的 PNG 可作为参考分镜或备用画面，不能冒充连续现场录屏。

## 可复制的纯旁白

Meet Orbyte, Team Allstar's tomorrow business readiness assistant for restaurant SMEs. This demonstration uses simulated events. We will check the alternatives, confirm missing information, and turn an owner-approved plan into a completed preparation task.

Tomorrow afternoon, rain may affect sixteen outdoor seats. Moving guests indoors conflicts with the saved bookings: all forty indoor seats are taken. Front-door pickup also conflicts with an overlapping road closure. Rear-door pickup remains uncertain because tomorrow's access has not been confirmed. Each result shows its supporting records.

Orbyte helps the owner ask a short, voluntary question: was the rear passage blocked? A customer selects no and submits an observation time. No personal details are required. This answer becomes an unverified lead. What someone saw today does not establish what will be available tomorrow.

The owner separately checks the works schedule for tomorrow's service window and records that rear access is usable. The rear plan now meets the known conditions. Indoor capacity and front access still conflict. The system updates the affected option while keeping the remaining constraints visible.

The owner prepares a rear-pickup task with exact instructions, a responsible person, a service window and an estimated cost of RM twenty. Approval records the owner's name, time and content snapshot. The estimate belongs to the owner; it is not a claimed saving.

Approval and execution are separate steps. We start the preparation, record the completion note, and mark it complete. If relevant conditions change before execution, the action needs another review and approval. External notification sending remains simulated in this MVP.

The real OpenRouter Copilot reloads the latest business context. It can explain the remaining constraints, inspect tasks and prepare drafts, with links to verified records. Temporary assumptions do not overwrite saved facts. The model has no tools to approve actions, verify access or complete tasks. Those decisions stay with the owner.

Orbyte connects tomorrow's risks to checked preparation. Built by Team Allstar. Explore the demo, and help us test it with restaurant owners.
