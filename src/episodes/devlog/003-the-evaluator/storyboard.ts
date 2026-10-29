import { rects } from "../../../engine/clip-style";
import type { Storyboard } from "../../../engine/types";

/**
 * Devlog 003 - The Evaluator
 *
 * Part 1 (player's view): Noita wand mechanics -> our stepping cards.
 * Part 2 (making-of): tree IR killed in the doc phase -> one-day
 * implementation -> the review cascade (lib.rs split, invented invariant,
 * Scope/TargetSpec unification, defensive-programming habits, the Eval
 * semantics mismatch, the multi-cause cast bug, wrap counting) -> red
 * tests -> per-node cost -> 28 tests.
 *
 * All code evidence is extracted verbatim from the alchemy-journey git
 * history (see file headers); chat scenes quote the 10-25/10-26 session
 * verbatim. Wand icons: Noita (Nolla Games), public/shared/noita-spells/.
 */
export const storyboard: Storyboard = {
  clips: [
    // ---- open ----
    {
      id: "title",
      type: "cinematic-title",
      title: "评估器",
      subtitle: "炼金之旅 Devlog 03 · 效果与评审",
      rect: rects.full,
      startAt: { line: "open.1" },
      endAt: [{ line: "open.1", end: true }],
    },

    // ---- Part 1: Noita wand mechanics (the running example) ----
    // 每次施放一个 clip（step 与台词严格对拍）；同一 rect、无 pane chrome，
    // 首个之外的 clip 不 fade，画面连续。initialCursor 手动接上次的休息位。
    {
      // 能量球-加速-弹跳球-伤害增幅-火焰轨迹-闪电箭
      id: "noita-wand",
      type: "wand",
      slots: [
        { icon: "Spell_slow_bullet.webp", label: "能量球" },
        { icon: "Spell_speed.webp", label: "加速" },
        { icon: "Spell_rubber_ball.webp", label: "弹跳球" },
        { icon: "Spell_damage.webp", label: "伤害增幅" },
        { icon: "Spell_fire_trail.webp", label: "火焰轨迹" },
        { icon: "Spell_light_bullet.webp", label: "闪电箭" },
      ],
      steps: [{ cursor: 1, note: "一根六格法杖" }],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      transitionIn: 15,
      startAt: { line: "noita.config" },
      endAt: [{ line: "noita.config", end: true }],
    },
    {
      id: "noita-cast1",
      type: "wand",
      slots: [
        { icon: "Spell_slow_bullet.webp", label: "能量球" },
        { icon: "Spell_speed.webp", label: "加速" },
        { icon: "Spell_rubber_ball.webp", label: "弹跳球" },
        { icon: "Spell_damage.webp", label: "伤害增幅" },
        { icon: "Spell_fire_trail.webp", label: "火焰轨迹" },
        { icon: "Spell_light_bullet.webp", label: "闪电箭" },
      ],
      steps: [{ consume: [1], cursor: 2, note: "第一次施放：普通能量球" }],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      startAt: { line: "noita.cast1" },
      endAt: [{ line: "noita.cast1", end: true }],
    },
    {
      id: "noita-cast2",
      type: "wand",
      slots: [
        { icon: "Spell_slow_bullet.webp", label: "能量球" },
        { icon: "Spell_speed.webp", label: "加速" },
        { icon: "Spell_rubber_ball.webp", label: "弹跳球" },
        { icon: "Spell_damage.webp", label: "伤害增幅" },
        { icon: "Spell_fire_trail.webp", label: "火焰轨迹" },
        { icon: "Spell_light_bullet.webp", label: "闪电箭" },
      ],
      initialCursor: 2,
      steps: [{ consume: [2, 3], cursor: 4, note: "第二次：带加速的弹跳球" }],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      startAt: { line: "noita.cast2" },
      endAt: [{ line: "noita.cast2", end: true }],
    },
    {
      id: "noita-cast3",
      type: "wand",
      slots: [
        { icon: "Spell_slow_bullet.webp", label: "能量球" },
        { icon: "Spell_speed.webp", label: "加速" },
        { icon: "Spell_rubber_ball.webp", label: "弹跳球" },
        { icon: "Spell_damage.webp", label: "伤害增幅" },
        { icon: "Spell_fire_trail.webp", label: "火焰轨迹" },
        { icon: "Spell_light_bullet.webp", label: "闪电箭" },
      ],
      initialCursor: 4,
      steps: [
        { consume: [4, 5, 6], cursor: 1, wrap: true, note: "第三次：增幅+火焰轨迹+闪电箭" },
      ],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      startAt: { line: "noita.cast3" },
      endAt: [{ line: "noita.cast3", end: true }],
    },
    {
      id: "noita-cast4",
      type: "wand",
      slots: [
        { icon: "Spell_slow_bullet.webp", label: "能量球" },
        { icon: "Spell_speed.webp", label: "加速" },
        { icon: "Spell_rubber_ball.webp", label: "弹跳球" },
        { icon: "Spell_damage.webp", label: "伤害增幅" },
        { icon: "Spell_fire_trail.webp", label: "火焰轨迹" },
        { icon: "Spell_light_bullet.webp", label: "闪电箭" },
      ],
      initialCursor: 1,
      steps: [{ consume: [1], cursor: 2, note: "第四次：回到开头" }],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      startAt: { line: "noita.cast4" },
      endAt: [{ line: "noita.cast4", end: true }],
    },

    // ---- our game: stepping cards ----
    {
      // 打击法术 6-9-15(content.rs 真实数值)
      id: "strike-wand",
      type: "wand",
      slots: [
        { icon: "Spell_light_bullet.webp", label: "6 伤害" },
        { icon: "Spell_light_bullet.webp", label: "9 伤害" },
        { icon: "Spell_light_bullet.webp", label: "15 伤害" },
      ],
      steps: [
        { cursor: 1, note: "打击法术：三格向量" },
        { consume: [1], cursor: 2, note: "第一次施放：6 点伤害，游标停在 2 号位" },
        { consume: [2], cursor: 3, note: "第二次：9 点伤害" },
        { consume: [3], cursor: 1, wrap: true, note: "第三次：15 点伤害，然后绕回" },
      ],
      // 三次施放不被台词逐个点名，stepInterval 均匀铺开即可
      stepInterval: 170,
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      transitionIn: 15,
      startAt: { line: "card.analogy" },
      endAt: [{ line: "card.vary", end: true }],
    },

    // ---- potion ----
    {
      // 20 伤害药水:PotionDef lowering => [Eval(1), Damage(20)],整瓶一次施放
      id: "potion-wand",
      type: "wand",
      slots: [
        { icon: "Spell_burst_2.webp", label: "Eval(1)" },
        { icon: "Spell_light_bullet.webp", label: "20 伤害" },
      ],
      steps: [
        { cursor: 1, note: "药水 lowering 成同一个指令向量" },
        { consume: [1, 2], cursor: 1, wrap: true, note: "零费,整瓶一次施放,用后消耗" },
      ],
      stepInterval: 110,
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      transitionIn: 15,
      startAt: { line: "potion.1" },
      endAt: [{ line: "potion.2", end: true }],
    },

    // ---- the AI's objection (real exchange, 10-25 15:53/16:18) ----
    {
      id: "static-chat",
      type: "chat",
      steps: [
        {
          role: "ai",
          text: "A card in hand is a commitment: the deck is information, and the genre's planning loop depends on \"what does this card do?\" having a static answer.",
        },
        {
          role: "user",
          text: "The planning loop depends on a predictable answer, not necessarily static. Some StS cards literally have \"random\" as part of the effect.",
        },
      ],
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "static.ai" },
      endAt: [{ line: "static.rebut", end: true }],
    },

    // ---- CombatOver 从简(DESIGN.md 真实条文) ----
    {
      id: "over-doc",
      type: "code",
      steps: ["over-minimal.md"],
      filename: "DESIGN.md",
      paneTitle: "Step-2 content decisions",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "over.simple" },
      endAt: [{ line: "over.simple", end: true }],
    },

    // ---- transition to Part 2 ----
    {
      id: "trans-title",
      type: "cinematic-title",
      title: "实现方法",
      subtitle: "玩家不可见的部分",
      rect: rects.full,
      startAt: { line: "trans.impl" },
      endAt: [{ line: "trans.impl", end: true }],
    },

    // ---- the tree we didn't build ----
    {
      id: "tree-ir",
      type: "code",
      steps: ["tree-ir.rs"],
      filename: "AI 的提案 · 2026-10-25",
      paneTitle: "证物",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "tree.proposal" },
      endAt: [{ line: "tree.textbook", end: true }],
    },
    {
      // 5-盾例子:一号位与三号位,中间先空着
      id: "shield-before",
      type: "wand",
      slots: [
        { icon: "Spell_energy_shield.webp", label: "护盾 5" },
        { empty: true },
        { icon: "Spell_energy_shield.webp", label: "护盾 5" },
      ],
      steps: [{ cursor: 1, note: "两个护盾节点,隔着空格" }],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      transitionIn: 15,
      startAt: { line: "tree.example1" },
      endAt: [{ line: "tree.example1", end: true }],
    },
    {
      // 插入增幅:向量层面只是插一格
      id: "shield-after",
      type: "wand",
      slots: [
        { icon: "Spell_energy_shield.webp", label: "护盾 5" },
        { icon: "Spell_damage.webp", label: "护盾×2" },
        { icon: "Spell_energy_shield.webp", label: "护盾 5" },
      ],
      steps: [{ cursor: 1, note: "插入增幅:向量只多一格,树要重搭" }],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      transitionIn: 15,
      startAt: { line: "tree.example2" },
      endAt: [{ line: "tree.example2", end: true }],
    },
    {
      // 拆树现场(10-25 15:32/15:33 原文)
      id: "tree-chat",
      type: "chat",
      steps: [
        {
          role: "user",
          text: "What does an explicit tree structure buy us? You'd still do DFS traversal, right? What's the resulting order? Isn't it just the vector scan order?",
        },
        {
          role: "ai",
          text: "Yes. For pure sequencing, DFS of the tree produces exactly the scan order of the flat vector. The tree is derived data - recompiled from the vector after every edit, then flattened right back by the walk.",
        },
      ],
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "tree.dfs" },
      endAt: [{ line: "tree.vector", end: true }],
    },
    {
      // 定稿:DESIGN.md \"settled - do not re-litigate\"
      id: "design-settled",
      type: "code",
      steps: ["design-settled.md"],
      filename: "DESIGN.md",
      paneTitle: "定稿",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "tree.deal" },
      endAt: [{ line: "tree.moral", end: true }],
    },

    // ---- one-day implementation ----
    {
      id: "impl-log",
      type: "terminal",
      steps: [
        {
          cwd: "~/alchemy-journey",
          command: "git log --oneline --since=10-25",
          output: [
            "33d185a Step 2 frontends: targeting flow, outcome display, effect readouts",
            "cd66d11 Step 2 core: effect IR, stepping evaluator, targeting, victory",
            "0891d96 DESIGN.md: settle the spell-casting mechanisms",
          ],
        },
      ],
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "impl.design" },
      endAt: [{ line: "impl.playable", end: true }],
    },

    // ---- the review cascade ----
    {
      id: "review-title",
      type: "chapter-title",
      chapter: 1,
      label: "REVIEW",
      title: "代码审查",
      rect: rects.full,
      startAt: { line: "review.why" },
      endAt: [{ line: "review.why", end: true }],
    },
    {
      // \"All in lib.rs is a red flag\"(10-26 13:52 原文)
      id: "librs-chat",
      type: "chat",
      steps: [
        {
          role: "user",
          text: "Even before I start reading the code, \"All in crates/combat/src/lib.rs\" is a red flag. How many responsibilities does that single file have?",
        },
      ],
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "review.librs" },
      endAt: [{ line: "review.librs2", end: true }],
    },
    {
      // 拆分结果:五模块 DAG(HEAD 真实 lib.rs)
      id: "lib-after",
      type: "code",
      steps: ["lib-after.rs"],
      filename: "crates/combat/src/lib.rs",
      paneTitle: "拆分后",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "review.split" },
      endAt: [{ line: "review.split", end: true }],
    },
    {
      // 偷偷发明的守恒规则(8800d0f^ 真实代码,带 mark)
      id: "conservation",
      type: "code",
      steps: ["conservation.rs"],
      filename: "state.rs",
      paneTitle: "评审现场",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "conserve.rule" },
      endAt: [{ line: "conserve.sts", end: true }],
    },
    {
      // TargetSpec/Scope 重复 -> 统一(9f1d155 前后真实代码)
      id: "scope",
      type: "code",
      steps: ["scope-before.rs", "scope-after.rs"],
      filename: "effect.rs",
      paneTitle: "统一前后",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "scope.dup" },
      endAt: [{ line: "scope.unify", end: true }],
    },

    // ---- the evaluator ----
    {
      id: "eval-title",
      type: "chapter-title",
      chapter: 2,
      label: "REVIEW",
      title: "重头戏:评估器",
      rect: rects.full,
      startAt: { line: "eval.intro" },
      endAt: [{ line: "eval.intro", end: true }],
    },
    {
      // 第一版循环:不可能的 \">=\"、budget=n、只在 Apply 处停(全部 mark)
      id: "loop-old",
      type: "code",
      key: "eval-loop",
      steps: ["loop-old.rs"],
      filename: "评估循环 · 第一版",
      paneTitle: "证物",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "defense.bug" },
      endAt: [{ line: "defense.hide", end: true }],
    },
    {
      id: "defense-list",
      type: "animated-list",
      items: [
        "前提破了?写成条件执行,跳过逻辑,程序继续跑",
        "输入非法?给一个看似合理的默认值,程序继续跑",
        "同一个问题:要假装没发现,继续运行吗?",
      ],
      rect: rects.large,
      transitionIn: 15,
      startAt: { line: "defense.q1" },
      endAt: [{ line: "defense.why2", end: true }],
    },
    {
      id: "defense-overlay",
      type: "overlay",
      title: "防自己的防御性编程",
      text: "在错误状态下继续运行,bug 会在几百步后一个无关的地方才爆出来",
      rect: { x: "58%", y: "62%", w: "36%", h: "24%" },
      zIndex: 10,
      transitionIn: 15,
      startAt: { line: "defense.name" },
      endAt: [{ line: "defense.name", end: true }],
    },
    {
      // 无上限循环:同一证物卡,换个焦点继续讲(内容延续)
      id: "loop-old-2",
      type: "code",
      key: "eval-loop",
      steps: ["loop-old.rs"],
      filename: "评估循环 · 第一版",
      paneTitle: "证物",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "loop.bug" },
      endAt: [{ line: "loop.ai", end: true }],
    },

    // ---- Eval semantics: intent mismatch, then the stack collapse ----
    {
      // 10-26 15:42 原文:理解错位的当场记录
      id: "sem-chat",
      type: "chat",
      key: "eval-review",
      steps: [
        {
          role: "user",
          text: "Eval setting budget = n. I didn't think of it as \"evaluate N steps\". I was thinking of \"grouping the next N blocks, treating them as one\".",
        },
      ],
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "sem.mismatch" },
      endAt: [{ line: "sem.mismatch", end: true }],
    },
    {
      // 链式续场(10-26 16:18 原文):栈塌缩成计数器
      id: "stack-chat",
      type: "chat",
      key: "eval-review",
      steps: [
        {
          role: "user",
          text: "Your quotas: Vec<u32>, for what we have now - isn't it different from just adding N-1 to budget at Eval(N)? This Vec<u32> quota overengineering isn't helping.",
        },
      ],
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "sem.stack" },
      endAt: [{ line: "sem.counter", end: true }],
    },

    // ---- the multi-cause bug ----
    {
      id: "bug-list",
      type: "animated-list",
      items: [
        "只在\"即将施放、但剩余次数不足\"时停止",
        "进入多重施放时,不检查剩余施放次数",
      ],
      rect: rects.large,
      transitionIn: 15,
      startAt: { line: "bug.intro" },
      endAt: [{ line: "bug.result", end: true }],
    },
    {
      // [伤害, Eval(2), 伤害, 伤害]:应该
      id: "bug-wand-ok",
      type: "wand",
      slots: [
        { icon: "Spell_light_bullet.webp", label: "伤害" },
        { icon: "Spell_burst_2.webp", label: "Eval(2)" },
        { icon: "Spell_light_bullet.webp", label: "伤害" },
        { icon: "Spell_light_bullet.webp", label: "伤害" },
      ],
      steps: [
        { consume: [1], cursor: 2, note: "应该：第一次施放打 1 次，停在 2 号位" },
      ],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      transitionIn: 15,
      startAt: { line: "bug.example" },
      endAt: [{ line: "bug.example", end: true }],
    },
    {
      // 实际：循环越过耗尽点，多打一次
      id: "bug-wand-bug",
      type: "wand",
      slots: [
        { icon: "Spell_light_bullet.webp", label: "伤害" },
        { icon: "Spell_burst_2.webp", label: "Eval(2)" },
        { icon: "Spell_light_bullet.webp", label: "伤害" },
        { icon: "Spell_light_bullet.webp", label: "伤害" },
      ],
      initialCursor: 1,
      steps: [
        { consume: [1, 2, 3], cursor: 4, note: "实际：循环越过耗尽点，多打一次" },
      ],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      startAt: { line: "bug.mechanism" },
      endAt: [{ line: "bug.mechanism", end: true }],
    },
    {
      // 修复:耗尽即停,停在下一格(HEAD 真实代码,single break)
      id: "loop-new",
      type: "code",
      key: "eval-loop",
      steps: ["loop-new.rs"],
      filename: "评估循环 · 修复后",
      paneTitle: "修复",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "fix.stop" },
      endAt: [{ line: "wrap.intro", end: true }],
    },

    // ---- wrap counting ----
    {
      // 绕回演示:打击法术绕回
      id: "wrap-how",
      type: "wand",
      slots: [
        { icon: "Spell_light_bullet.webp", label: "6 伤害" },
        { icon: "Spell_light_bullet.webp", label: "9 伤害" },
        { icon: "Spell_light_bullet.webp", label: "15 伤害" },
      ],
      steps: [
        { consume: [3], cursor: 1, wrap: true, note: "走到末尾还有次数:绕回开头继续" },
      ],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      transitionIn: 15,
      startAt: { line: "wrap.how" },
      endAt: [{ line: "wrap.v1", end: true }],
    },
    {
      // 稀疏法杖:4 格只装 1 个
      id: "wrap-sparse",
      type: "wand",
      slots: [
        { icon: "Spell_light_bullet.webp", label: "伤害" },
        { empty: true },
        { empty: true },
        { empty: true },
      ],
      steps: [{ cursor: 1, note: "4 格法杖，只在 1 号位装了效果" }],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      transitionIn: 15,
      startAt: { line: "wrap.sparse" },
      endAt: [{ line: "wrap.sparse", end: true }],
    },
    {
      // 旧规则：第二发空放（同一行里两次施放，半步对拍即可）
      id: "wrap-starve",
      type: "wand",
      slots: [
        { icon: "Spell_light_bullet.webp", label: "伤害" },
        { empty: true },
        { empty: true },
        { empty: true },
      ],
      steps: [
        { consume: [1], cursor: 2, note: "第一次施放：正常，指针停在 2 号位" },
        { consume: [], cursor: 1, wrap: true, note: "第二次：路过 1 号位触发绕回上限，空放" },
      ],
      stepInterval: 80,
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      startAt: { line: "wrap.starve" },
      endAt: [{ line: "wrap.starve", end: true }],
    },
    {
      // 修复后：从本次起始点算圈数，正常打出
      id: "wrap-fixed",
      type: "wand",
      slots: [
        { icon: "Spell_light_bullet.webp", label: "伤害" },
        { empty: true },
        { empty: true },
        { empty: true },
      ],
      initialCursor: 2,
      steps: [
        { consume: [1], cursor: 2, note: "修复后：从起始点算圈数，正常打出 1 号位" },
      ],
      rect: { x: "8%", y: "24%", w: "84%", h: "52%" },
      startAt: { line: "wrap.fix" },
      endAt: [{ line: "wrap.fix", end: true }],
    },

    // ---- red test first ----
    {
      id: "red-test",
      type: "terminal",
      steps: [
        {
          cwd: "~/alchemy-journey",
          command: "cargo test cast_stops",
          output: [
            "running 1 test",
            "thread 'tests::cast_stops_when_its_quota_is_spent' panicked at crates\\combat\\src\\tests.rs:374:5:",
            "assertion `left == right` failed",
            "  left: 28",
            " right: 29",
            "test result: FAILED. 0 passed; 1 failed; 21 filtered out",
          ],
        },
      ],
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "test.rule" },
      endAt: [{ line: "test.filter", end: true }],
    },

    // ---- cost moves to the nodes ----
    {
      id: "cost",
      type: "code",
      steps: ["cost-before.rs", "cost-after.rs"],
      filename: "费用字段之死",
      paneTitle: "设计变更",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "cost.field" },
      endAt: [{ line: "cost.done", end: true }],
    },

    // ---- results ----
    {
      id: "green-test",
      type: "terminal",
      steps: [
        {
          cwd: "~/alchemy-journey",
          command: "cargo test -p alchemy-combat",
          output: [
            "test tests::block_absorbs_damage_before_hp ... ok",
            "test tests::cast_stops_when_its_quota_is_spent ... ok",
            "test tests::content_before_the_cursor_does_not_starve ... ok",
            "test tests::eval_groups_nest_multiplicatively ... ok",
            "test tests::two_engines_stay_in_lockstep ... ok",
            "...",
            "test result: ok. 28 passed; 0 failed",
          ],
        },
      ],
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "result.tests" },
      endAt: [{ line: "result.tests", end: true }],
    },
    {
      id: "lockstep",
      type: "code",
      steps: ["lockstep.rs"],
      filename: "two_engines_stay_in_lockstep",
      paneTitle: "自适应脚本",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "result.lockstep" },
      endAt: [{ line: "result.lockstep", end: true }],
    },
    {
      id: "starter",
      type: "code",
      steps: ["starter.rs"],
      filename: "content.rs",
      paneTitle: "起步卡组",
      rect: rects.xl,
      transitionIn: 15,
      startAt: { line: "result.eval" },
      endAt: [{ line: "result.eval", end: true }],
    },
    {
      id: "outro-title",
      type: "cinematic-title",
      title: "下一集",
      subtitle: "敌人该动起来了",
      rect: rects.full,
      startAt: { line: "outro.next" },
      endAt: [{ line: "outro.next", end: true }],
    },
  ],
};
