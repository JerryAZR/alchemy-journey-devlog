/// A target *role*, resolved to concrete units at application time.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TargetSpec {
    Caster,
    AllEnemies,
    AllAllies,
    Everyone,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
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

/// Potion authoring type. The invariants (flat, single scope, predefined
/// order) are enforced here, at the authoring layer, not in the executor.
#[derive(Clone, Debug, PartialEq)]
pub struct PotionDef {
    pub scope: Scope,
    pub effects: Vec<Atom>,
}

