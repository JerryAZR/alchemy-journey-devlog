// 统一后:Chosen 是注册表默认值,BindTarget(Chosen) 就是从任何绑定回去的路
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
