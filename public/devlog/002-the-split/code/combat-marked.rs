impl CombatState {
    pub fn play_card(&mut self, hand_index: usize) -> Result<(), PlayError> { /* ... */ }

    // !mark(1:2)
    /// Ends the player turn: hand is discarded, phase flips to the enemy.
    pub fn end_player_turn(&mut self) { /* ... */ }

    // !mark(1:2)
    /// Runs the (currently inert) enemy turn, then starts the next player turn.
    pub fn run_enemy_turn(&mut self) { /* ... */ }
}
