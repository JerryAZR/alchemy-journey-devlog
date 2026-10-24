pub struct CombatState {
    pub turn: u32,
    pub phase: Phase,
    pub player: Unit,
    pub enemy: Unit,
    pub energy: u32,
    pub deck: Vec<Card>,
    pub hand: Vec<Card>,
    pub discard: Vec<Card>,
    pub consumed: Vec<Card>,
    pub log: Vec<String>,
    rng: StdRng,
}

impl CombatState {
    pub fn play_card(&mut self, hand_index: usize) -> Result<(), PlayError> { /* ... */ }

    // !mark(1:2)
    /// Ends the player turn: hand is discarded, phase flips to the enemy.
    pub fn end_player_turn(&mut self) { /* ... */ }

    // !mark(1:2)
    /// Runs the (currently inert) enemy turn, then starts the next player turn.
    pub fn run_enemy_turn(&mut self) { /* ... */ }
}
