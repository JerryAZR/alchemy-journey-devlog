/// A target *role*, resolved to concrete units at application time.
/// `Chosen` is the player's play-time pick — the default register value,
/// so `BindTarget(Chosen)` is also the way back from any other bind.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TargetSpec {
    Chosen,
    Caster,
    AllEnemies,
    AllAllies,
    Everyone,
}

/// One node in a card's program. Cost is a property of the *node*
/// (DESIGN.md): a component's price travels with it, not with the wand —
