impl CombatState {
    pub fn play_card(&mut self, hand_index: usize) -> Result<(), PlayError> {
        // ...
    }

    // !mark(1:2)
    /// Ends the player turn: hand is discarded, phase flips to the enemy.
    pub fn end_player_turn(&mut self) {
        // ...
    }

    // !mark(1:9)
    /// Runs the (currently inert) enemy turn, then starts the next player turn.
    pub fn run_enemy_turn(&mut self) {
        self.log(format!("{} does nothing.", self.enemy.name));
        self.turn += 1;
        self.phase = Phase::PlayerTurn;
        self.energy = ENERGY_PER_TURN;
        self.log(format!("Turn {} begins.", self.turn));
        self.draw_to_hand_size(); // !callout[14:31] 抽牌藏在这里——敌方回合的末尾
    }
}
