// 法术侧的目标角色
/// A target *role*, resolved to concrete units at application time.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TargetSpec {
    Caster,
    AllEnemies,
    AllAllies,
    Everyone,
}

// 法术侧的指令:Chosen 被特殊处理成一条单独的指令
pub enum Instruction {
    /// This cast applies up to N atoms (the default is 1). Potions lower
    /// with their exact atom count; "evaluate all" needs no special case.
    Eval(u32),
    /// Redirect the following atoms until cleared or replaced.
    BindTarget(TargetSpec),
    /// Return to the chosen-target default.
    ClearBind,
    /// Apply one atom to the resolved target.
    Apply(Atom),
}

// 药水侧的范围:同一个概念,另一种写法
pub enum Scope {
    /// The drinker.
    Caster,
    /// One chosen unit; the player picks the target at play time.
    OneUnit,
}
