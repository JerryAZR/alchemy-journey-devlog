import { rects } from "../../../engine/clip-style";
import type { Storyboard } from "../../../engine/types";

// Devlog 001 — 我又开始做游戏了
//
// 素材状态：
//   video/tower-defense-demo.mp4  ✅ 已就位
//   video/sts-gameplay.mp4        ✅ 已就位
//   video/magicraft-gameplay.mp4  ✅ 已就位
//   video/atelier-synthesis.mp4   ✅ 已就位
//   video/step1-gameplay.mp4      ✅ 已就位
//   video/gitlab-notice.mp4       ✅ 官方邮件截图（静态视频）
//   video/gitlab-blocked.mp4      ✅ 封号截图（静态视频）

// 第一幕：标题
const hookClips: Storyboard["clips"] = [
  {
    id: "hook-title",
    type: "cinematic-title",
    title: "我又开始做游戏了",
    subtitle: "Alchemy Journey · Devlog #1",
    rect: rects.full,
    startAt: { line: "hook.restart" },
    endAt: [{ line: "hook.again", end: true }],
  },
];

// 第二幕：GitLab 黑历史（真实项目名；邮件与封号截图为静态视频）
const graveyardClips: Storyboard["clips"] = [
  {
    id: "graveyard-list",
    type: "animated-list",
    paneTitle: "GitLab · 已注销",
    items: [
      "Wanderland   肉鸽地牢探索 · 六边形网格 · 回合制",
      "PixelLand    俯视角弹幕",
      "LoopForge    横版平台动作",
    ],
    rect: rects.large,
    transitionIn: 15,
    transitionOut: 20,
    startAt: { line: "graveyard.repos" },
    endAt: [{ line: "graveyard.silence", end: true }],
  },
  {
    id: "gitlab-notice",
    type: "video",
    src: "gitlab-notice.mp4",
    paneTitle: "2025-06-08 · GitLab 官方邮件",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "graveyard.notice" },
    endAt: [{ line: "graveyard.notice", end: true }],
  },
  {
    id: "gitlab-notice-callout",
    type: "overlay",
    text: "07-08-2025 之后\n删除账户",
    rect: { x: "60%", y: "60%", w: "28%", h: "22%" },
    zIndex: 10,
    transitionIn: 15,
    startAt: { line: "graveyard.notice", offsetFrames: 45 },
    endAt: [{ line: "graveyard.notice", end: true }],
  },
  {
    id: "gitlab-blocked",
    type: "video",
    src: "gitlab-blocked.mp4",
    paneTitle: "gitlab.com · 登录",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "graveyard.blocked" },
    endAt: [{ line: "graveyard.blocked", end: true }],
  },
];

// 第三幕：杀戮尖塔
const stsClips: Storyboard["clips"] = [
  {
    id: "sts-video",
    type: "video",
    src: "sts-gameplay.mp4",
    // 22.4s 素材压进 18.2s 窗口：微加速保住尾部斩杀，不截断
    playbackRate: 1.25,
    rect: rects.large,
    startAt: { line: "sts.addicted" },
    endAt: [{ line: "sts.spark", end: true }],
  },
];

// 第四幕：核心创意（两段实机录屏 + 收尾）
const ideaClips: Storyboard["clips"] = [
  {
    // 承上启下的过场：标题卡，不用纯文字卡撑场面
    id: "idea-twist-title",
    type: "cinematic-title",
    title: "照抄没意思",
    subtitle: "加点自己的东西",
    rect: rects.full,
    transitionIn: 15,
    startAt: { line: "idea.twist" },
    endAt: [{ line: "idea.twist", end: true }],
  },
  {
    id: "idea-magicraft-video",
    type: "video",
    src: "magicraft-gameplay.mp4",
    // 10s 素材微加速填满 idea.noita 窗口（8.1s），之后定格在末帧，
    // 作为静帧陪衬右侧的炼金工坊段落，直到 idea.question 结束
    playbackRate: 1.25,
    paneTitle: "魔法工艺 Magicraft",
    rect: rects.splitLeft,
    startAt: { line: "idea.noita" },
    endAt: [{ line: "idea.question", end: true }],
  },
  {
    id: "idea-atelier-video",
    type: "video",
    src: "atelier-synthesis.mp4",
    // 19.2s 素材压进 13.1s 窗口（idea.atelier + idea.question）
    playbackRate: 1.5,
    paneTitle: "苏菲的炼金工房2",
    rect: rects.splitRight,
    transitionIn: 15,
    startAt: { line: "idea.atelier" },
    endAt: [{ line: "idea.question", end: true }],
  },
];

// 第五幕：塔防证明自己能做完
const proofClips: Storyboard["clips"] = [
  {
    id: "tower-defense-video",
    type: "video",
    src: "tower-defense-demo.mp4",
    // 33.9s 素材覆盖整个 proof 段 + 其后两句反思（proof.lesson /
    // devlog.format 是这段内容的延续，B-roll 延长过来，字幕承载信息）
    rect: rects.large,
    startAt: { line: "proof.towerdefense" },
    endAt: [{ line: "devlog.format", end: true }],
  },
  {
    id: "proof-videos-card",
    type: "overlay",
    title: "顺便",
    text: "还录了\n一整套教学视频",
    rect: { x: "62%", y: "60%", w: "26%", h: "22%" },
    zIndex: 10,
    transitionIn: 15,
    startAt: { line: "proof.videos" },
    endAt: [{ line: "proof.videos", end: true }],
  },
];

// 第六幕无独立画面：proof.lesson / devlog.format 由塔防 B-roll 覆盖

// 第七幕：AI + 收尾（先给论据：DeepSWE 榜单；prompt 卡到 ai.try 才出现）
const aiClips: Storyboard["clips"] = [
  {
    id: "ai-board",
    type: "video",
    src: "ai-leaderboard.mp4",
    paneTitle: "DeepSWE Leaderboard · updated 2025-09-22",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "ai.different" },
    endAt: [{ line: "ai.different", end: true }],
  },
  {
    // 同一张图的高亮版：焦点收束到实际使用的 kimi-k3（见 session log）
    id: "ai-board-kimi",
    type: "video",
    src: "ai-leaderboard-kimi.mp4",
    paneTitle: "DeepSWE Leaderboard · kimi-k3",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "ai.before" },
    endAt: [{ line: "ai.before", end: true }],
  },
  {
    id: "ai-prompt",
    type: "code",
    steps: ["first-prompt.md"],
    filename: "2026-10-12 · 发给 AI 的第一条消息",
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "ai.try" },
    endAt: [{ line: "ai.try", end: true }],
  },
];

// 第八幕：第一版验收
const resultClips: Storyboard["clips"] = [
  {
    id: "task-scope",
    type: "animated-list",
    paneTitle: "Step 1 · 最小可玩循环",
    items: [
      "抽牌到手牌上限",
      "点击出牌",
      "结束回合，敌人跳过",
      "弃牌堆洗回牌库",
    ],
    rect: rects.large,
    transitionIn: 15,
    startAt: { line: "task.first" },
    endAt: [{ line: "task.why", end: true }],
  },
  {
    id: "result-video",
    type: "video",
    src: "step1-gameplay.mp4",
    // 15.1s 素材压进 8.3s 窗口（result.looks + result.playtest）；
    // 若节奏太赶可改用 startFrom 截取精华段 + 更低倍速
    playbackRate: 1.8,
    rect: rects.large,
    startAt: { line: "result.looks" },
    endAt: [{ line: "result.playtest", end: true }],
  },
  {
    id: "next-title",
    type: "cinematic-title",
    title: "代码质量怎么样？",
    subtitle: "下集再看",
    rect: rects.full,
    transitionIn: 15,
    startAt: { line: "next.quality" },
    endAt: [{ line: "next.quality", end: true }],
  },
];

export const storyboard: Storyboard = {
  subtitles: true,
  clips: [
    ...hookClips,
    ...graveyardClips,
    ...stsClips,
    ...ideaClips,
    ...proofClips,
    ...aiClips,
    ...resultClips,
  ],
};
