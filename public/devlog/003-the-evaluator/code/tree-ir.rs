// AI 的提案（2026-10-25 设计讨论，DESIGN.md 初稿同款）
enum Atom { Damage(u32), Block(u32) }

enum Effect {
    Atom(Atom),                        // 叶子：做一件具体的事
    Sequence(Vec<Effect>),             // 纯排序：依次执行
    WithTarget(UnitRef, Box<Effect>),  // 为子树绑定目标
}

// + 一个携带"当前目标"上下文的 tree-walking 解释器
