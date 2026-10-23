/// Static enemy definition: how an enemy is spawned. Its action
/// graph attaches here in step 3 — never to the live `Unit`.
pub struct EnemyDef { /* ... */ }

/// A player's run-persistent state: survives combats, carries no
/// combat mechanics (no hand, no discard, no block, no energy).
pub struct PlayerRunState { /* ... */ }

/// Transient combat state.
pub struct CombatState {
    pub turn: u32,
    /// Every human player, facing the enemy group together.
    pub players: Vec<CombatPlayer>,
    /// The enemy group. One today; commonly several.
    pub enemies: Vec<Unit>,
    rng: StdRng,
}
