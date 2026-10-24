/// Ends the player turn: hand is discarded, phase flips to the enemy.
pub fn end_player_turn(&mut self) {
    if self.phase != Phase::PlayerTurn {
        return;
    }
    let held = std::mem::take(&mut self.hand);
    for card in held {
        self.discard.push(card);
    }
    self.phase = Phase::EnemyTurn;
    self.log("Player ends turn.".to_string());
}

// !mark(1:10)
/// Runs the (currently inert) enemy turn, then starts the next player turn.
pub fn run_enemy_turn(&mut self) {
    self.log(format!("{} does nothing.", self.enemy.name));
    self.turn += 1;
    self.phase = Phase::PlayerTurn;
    self.energy = ENERGY_PER_TURN;
    self.log(format!("Turn {} begins.", self.turn));
    // !callout[10:27] 抽牌藏在这里——敌方回合的末尾
    self.draw_to_hand_size();
}
