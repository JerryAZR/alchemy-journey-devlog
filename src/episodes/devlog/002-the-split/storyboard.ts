import { rects } from "../../../engine/clip-style";
import type { Storyboard } from "../../../engine/types";

// Devlog 002 — The Split（前后端拆分：边界、黑盒、四轮交锋）
//
// 素材状态：
//   video/gameplay.mp4        ✅ 拆分后实机（终端事件流 + UI，18s@30fps）
//   code/combat-*.rs, ui-*.rs ✅ step-1 真实代码摘录（@28bc73a）
//   code/door.rs, combat-new.rs ✅ 拆分后真实代码（@main）
//   code/r*-proposal.*        ✅ AI 提案卡（已枪毙，diff 红色表达）
//   code/q-*.md               ✅ 证物卡：session log 原话（英文）
//   code/combat-md.md         ✅ COMBAT.md Ruling 1 摘录

// ── 书接上回：读代码发现缺陷 ─────────────────────────────
const openClips: Storyboard["clips"] = [
  {
    // 回收第一集的钩子卡
    id: "open-title",
    type: "cinematic-title",
    title: "代码质量怎么样？",
    subtitle: "Alchemy Journey · Devlog #2",
    rect: rects.full,
    startAt: { line: "open.hook" },
    endAt: [{ line: "open.hook", end: true }],
  },
  {
    id: "review-scan",
    type: "code",
    key: "review",
    steps: ["combat-scan.rs"],
    filename: "src/combat/mod.rs · @28bc73a",
    rect: rects.xl,
    transitionIn: 15,
    startAt: { line: "open.habit" },
    endAt: [{ line: "open.scan", end: true }],
  },
  {
    id: "review-marked",
    type: "code",
    key: "review",
    steps: ["combat-marked.rs"],
    filename: "src/combat/mod.rs · @28bc73a",
    rect: rects.xl,
    startAt: { line: "open.missing" },
    endAt: [{ line: "open.missing", end: true }],
  },
  {
    // open.guess：展开 run_enemy_turn 全身（callout 指向藏起来的抽牌），
    // 大改写用 line 过渡；scrollTo 3 轻卷——callout 避开字幕条即可，
    // 别把 end_player_turn 的签名卷出画面
    id: "review-marked-2",
    type: "code",
    key: "review",
    steps: ["combat-marked-2.rs"],
    filename: "src/combat/mod.rs · @28bc73a",
    rect: rects.xl,
    // eslint-disable-next-line @remotion/non-pure-animation -- data property (code morph granularity), not a CSS transition
    transition: "line",
    scrollTo: 2,
    startAt: { line: "open.guess" },
    endAt: [{ line: "open.guess", end: true }],
  },
  {
    id: "review-ui-plain",
    type: "code",
    key: "review",
    steps: ["ui-1.rs"],
    filename: "src/ui/mod.rs · @28bc73a",
    rect: rects.xl,
    startAt: { line: "open.usage" },
    endAt: [{ line: "open.usage", end: true }],
  },
  {
    id: "review-ui-marked",
    type: "code",
    key: "review",
    steps: ["ui-2.rs"],
    filename: "src/ui/mod.rs · @28bc73a",
    // open.sts / open.severity 是这段的延续评价，卡片停留当 B-roll
    rect: rects.xl,
    startAt: { line: "open.answer" },
    endAt: [{ line: "open.severity", end: true }],
  },
  {
    // 杀戮尖塔老梗：浮动点缀，不撑场面
    id: "sts-meme",
    type: "overlay",
    title: "杀戮尖塔老梗",
    text: "“动画大于一切”",
    rect: { x: "60%", y: "62%", w: "28%", h: "20%" },
    zIndex: 10,
    transitionIn: 15,
    startAt: { line: "open.sts" },
    endAt: [{ line: "open.sts", end: true }],
  },
  {
    id: "task-title",
    type: "cinematic-title",
    title: "任务：前后端拆分",
    subtitle: "The Split",
    rect: rects.full,
    transitionIn: 15,
    startAt: { line: "open.task" },
    endAt: [{ line: "open.task", end: true }],
  },
];

// ── 拆分思路 ─────────────────────────────────────────────
const splitClips: Storyboard["clips"] = [
  {
    id: "split-list",
    type: "animated-list",
    paneTitle: "拆分方案",
    items: [
      "crates/combat —— 纯 Rust 核心，只依赖 rand",
      "driver —— 收集意图 · 盖身份 · 校验",
      "前端 ×2 —— Bevy UI + 终端打印器，同一条事件流",
    ],
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "split.ecs" },
    endAt: [{ line: "split.boundary", end: true }],
  },
];

// ── AI 品味论 ────────────────────────────────────────────
const tasteClips: Storyboard["clips"] = [
  {
    id: "taste-list",
    type: "animated-list",
    paneTitle: "AI 代码的长板与短板",
    items: [
      "✓ 能跑",
      "✓ 正确缩进 · 命名清晰 · 风格一致",
      "✗ 结构简单精巧",
      "✗ 意图清晰",
      "✗ 模块划分准确",
    ],
    // taste.mountain / taste.toolate 是延续评价，列表停留
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "taste.linter" },
    endAt: [{ line: "taste.toolate", end: true }],
  },
  {
    id: "taste-doc",
    type: "code",
    steps: ["combat-md.md"],
    filename: "COMBAT.md",
    paneTitle: "架构先行 · 设计裁决文档",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "taste.doc" },
    endAt: [{ line: "taste.doc", end: true }],
  },
];

// ── 交锋一：advance() 泵 ─────────────────────────────────
const r1Clips: Storyboard["clips"] = [
  {
    id: "r1-proposal",
    type: "code",
    steps: ["r1-proposal.rs"],
    filename: "advance.rs",
    paneTitle: "交锋一 · AI 的提案",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r1.proposal" },
    endAt: [{ line: "r1.inertia", end: true }],
  },
  {
    id: "r1-tag",
    type: "overlay",
    title: "诊断",
    text: "惯性思维",
    rect: { x: "62%", y: "62%", w: "24%", h: "18%" },
    zIndex: 10,
    transitionIn: 15,
    startAt: { line: "r1.inertia" },
    endAt: [{ line: "r1.inertia", end: true }],
  },
  {
    // 评审现场重现：scrollback 里是 AI 的提案原文摘录（10-13 14:25），
    // 用户当着观众的面敲出那句毙掉 advance() 的话
    id: "r1-chat",
    type: "chat",
    steps: [
      {
        role: "ai",
        text: "advance() is not part of the protocol. Parameterless, a pure function of state: it advances the core's pending machinery by one beat. Callers own pacing (when to pump), never sequencing.",
      },
      {
        role: "user",
        text: "Another way to argue against frontend calling advance: if advance is going to be called eventually, then timing is pointless to the backend.",
      },
    ],
    rect: rects.xl,
    transitionIn: 15,
    startAt: { line: "r1.question" },
    endAt: [{ line: "r1.question", end: true }],
  },
  {
    id: "r1-door",
    type: "code",
    steps: ["door.rs"],
    filename: "crates/combat/src/lib.rs · @main",
    paneTitle: "落地：同步全解析",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r1.sync" },
    endAt: [{ line: "r1.frontend", end: true }],
  },
];

// ── 交锋二：连接即身份 ───────────────────────────────────
const r2Clips: Storyboard["clips"] = [
  {
    id: "r2-list",
    type: "animated-list",
    paneTitle: "多人架构原则",
    items: [
      "未必要第一天就完整支持多人",
      "一定要第一天就想到「可能有多位玩家」",
      "不能让「只有一个玩家」的假设溜进系统",
    ],
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r2.mp" },
    endAt: [{ line: "r2.id", end: true }],
  },
  {
    id: "r2-proposal",
    type: "code",
    steps: ["r2-proposal.rs"],
    filename: "identity.rs",
    paneTitle: "交锋二 · AI 的提案：连接即身份",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r2.proposal" },
    endAt: [{ line: "r2.proposal", end: true }],
  },
  {
    // 评审现场：AI 的“安全洞察”提案原文摘录（10-12 15:31），
    // 用户敲出“What malicious attacker are you expecting?”
    id: "r2-chat",
    type: "chat",
    steps: [
      {
        role: "ai",
        text: "The parenthetical is the key security insight: identity on the wire is only trustworthy server -> client. Client -> server, the connection is the identity - a client-supplied \"I am player 2\" field is spoofable.",
      },
      {
        role: "user",
        text: "What is \"security insight\"? This is a game played with friends, might even be moddable. What \"malicious attacker\" are you expecting?",
      },
    ],
    rect: rects.xl,
    transitionIn: 15,
    startAt: { line: "r2.question" },
    endAt: [{ line: "r2.question", end: true }],
  },
  {
    id: "r2-questions",
    type: "animated-list",
    paneTitle: "安全命题 · 四问",
    items: [
      "预期的攻击是什么？",
      "防御的边界在哪里？",
      "假想的攻击场景存在吗？",
      "付出的代价值得吗？",
    ],
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r2.cliche" },
    endAt: [{ line: "r2.checklist", end: true }],
  },
  {
    id: "r2-bugs",
    type: "code",
    steps: ["q-bugs.md"],
    filename: "2026-10-12 · 第二回合",
    paneTitle: "证物",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r2.excuse" },
    endAt: [{ line: "r2.inertia", end: true }],
  },
  {
    id: "r2-tag",
    type: "overlay",
    title: "惯性思维 · 梅开二度",
    text: "换个理由，维护原提案",
    rect: { x: "58%", y: "62%", w: "30%", h: "20%" },
    zIndex: 10,
    transitionIn: 15,
    startAt: { line: "r2.inertia", offsetFrames: 30 },
    endAt: [{ line: "r2.inertia", end: true }],
  },
];

// ── 交锋三：广播事件流 vs lockstep ───────────────────────
const r3Clips: Storyboard["clips"] = [
  {
    id: "r3-proposal",
    type: "code",
    steps: ["r3-proposal.rs"],
    filename: "plan-apply.rs",
    paneTitle: "交锋三 · AI 的提案：plan / apply",
    // r3.context 是承上启下，提案卡提前入场铺垫
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r3.context" },
    endAt: [{ line: "r3.proposal", end: true }],
  },
  {
    id: "r3-tag",
    type: "overlay",
    title: "诊断",
    text: "过度解读「主机权威」\n忽略了哪些事件本来就确定",
    rect: { x: "56%", y: "60%", w: "32%", h: "22%" },
    zIndex: 10,
    transitionIn: 15,
    startAt: { line: "r3.verdict" },
    endAt: [{ line: "r3.verdict", end: true }],
  },
  {
    id: "r3-quote",
    type: "code",
    steps: ["q-lockstep.md"],
    filename: "2026-10-17 · 反案：lockstep",
    paneTitle: "证物",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r3.lockstep" },
    endAt: [{ line: "r3.benefits", end: true }],
  },
];

// ── 交锋四：一刀切禁令 ───────────────────────────────────
const r4Clips: Storyboard["clips"] = [
  {
    id: "r4-ban",
    type: "code",
    steps: ["r4-ban.md"],
    filename: "determinism-rules.md",
    paneTitle: "交锋四 · AI 的提案",
    // r4.context 是承上启下，提案卡提前入场
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r4.context" },
    endAt: [{ line: "r4.training", end: true }],
  },
  {
    id: "r4-quote",
    type: "code",
    steps: ["q-float.md"],
    filename: "2026-10-17 · 评审记录",
    paneTitle: "证物",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "r4.float" },
    endAt: [{ line: "r4.hash", end: true }],
  },
];

// ── 是非题探针 ───────────────────────────────────────────
const probeClips: Storyboard["clips"] = [
  {
    // 是非题现场：用户敲出问题，AI 诚实认账（原文摘录，10-13 14:18）
    id: "probe-chat",
    type: "chat",
    steps: [
      {
        role: "user",
        text: "Before I look at it, here's a quick self test: can you drive a full game, pragramatically, without any UI, and without the testbench help maintaining any game state?",
      },
      { role: "thinking" },
      {
        role: "ai",
        text: "Honest answer: almost. Gap 1: the caller must know the transition graph - a structural flaw. Gap 2: combat cannot end - a feature gap.",
      },
    ],
    rect: rects.xl,
    transitionIn: 15,
    startAt: { line: "probe.question" },
    endAt: [{ line: "probe.pretend", end: true }],
  },
  {
    id: "probe-tag",
    type: "overlay",
    title: "暴露",
    text: "后端不知道自己的状态转移图",
    rect: { x: "54%", y: "62%", w: "34%", h: "20%" },
    zIndex: 10,
    transitionIn: 15,
    startAt: { line: "probe.reveal" },
    endAt: [{ line: "probe.expectation", end: true }],
  },
  {
    id: "probe-tag2",
    type: "overlay",
    text: "却假装理解了",
    rect: { x: "60%", y: "66%", w: "26%", h: "16%" },
    zIndex: 10,
    transitionIn: 15,
    startAt: { line: "probe.pretend", offsetFrames: 20 },
    endAt: [{ line: "probe.pretend", end: true }],
  },
];

// ── 战果 ─────────────────────────────────────────────────
const resultClips: Storyboard["clips"] = [
  {
    // 真实输出：asset-src 副本里 cargo test -p alchemy-combat 跑出来的
    id: "result-term",
    type: "terminal",
    paneTitle: "拆分后 · 自动化测试",
    steps: [
      {
        cwd: "~/alchemy-journey",
        command: "cargo test -p alchemy-combat",
        output: [
          "running 12 tests",
          "test tests::playing_a_potion_consumes_it ... ok",
          "test tests::combat_start_copies_run_state_in ... ok",
          "test tests::deterministic_seed_reproduces_state_and_events ... ok",
          "test tests::consumed_cards_are_never_redrawn ... ok",
          "test tests::reshuffle_happens_mid_draw_and_the_event_stream_proves_it ... ok",
          "test tests::intents_from_unknown_players_fail_validation ... ok",
          "test tests::piles_are_per_player ... ok",
          "test tests::end_turn_runs_the_full_round_synchronously ... ok",
          "test tests::illegal_intents_fail_validation ... ok",
          "test tests::the_round_advances_only_when_all_players_have_ended ... ok",
          "test tests::two_engines_stay_in_lockstep ... ok",
          "test tests::playing_a_reusable_card_sends_it_to_discard ... ok",
          "test result: ok. 12 passed; 0 failed",
        ],
      },
    ],
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "result.boundary" },
    endAt: [{ line: "result.boundary", end: true }],
  },
  {
    id: "result-state",
    type: "code",
    steps: ["combat-new.rs"],
    filename: "crates/combat/src/lib.rs · @main",
    paneTitle: "CombatState 重做 · 三层数据",
    rect: rects.xl,
    transitionIn: 15,
    startAt: { line: "result.combatstate" },
    endAt: [{ line: "result.combatstate", end: true }],
  },
  {
    // “玩家可见的部分没有任何变化”——直接放拆分后实机（终端事件流 + UI）
    id: "result-video",
    type: "video",
    src: "gameplay.mp4",
    // 跳过开头的 git/cargo 编译段（前 ~170 帧），剩余 ~368 帧以 1.8x
    // 压进 result.same 窗口（约 202 帧）
    startFrom: 170,
    playbackRate: 1.8,
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "result.same" },
    endAt: [{ line: "result.same", end: true }],
  },
];

// ── 钩子 ─────────────────────────────────────────────────
const outroClips: Storyboard["clips"] = [
  {
    id: "outro-title",
    type: "cinematic-title",
    title: "下一集：卡牌要见效了",
    subtitle: "Step 2 · 真实卡牌效果",
    rect: rects.full,
    transitionIn: 15,
    startAt: { line: "outro.next" },
    endAt: [{ line: "outro.next", end: true }],
  },
];

export const storyboard: Storyboard = {
  subtitles: true,
  clips: [
    ...openClips,
    ...splitClips,
    ...tasteClips,
    ...r1Clips,
    ...r2Clips,
    ...r3Clips,
    ...r4Clips,
    ...probeClips,
    ...resultClips,
    ...outroClips,
  ],
};
