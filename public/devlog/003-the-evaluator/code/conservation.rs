impl CombatPlayer {
    // !mark(1:2)
    /// Total cards across this player's piles; must stay constant.
    /// Used by tests; will surface in a debug overlay later.
    // !mark
    #[allow(dead_code)]
    pub fn total_cards(&self) -> usize {
        self.deck.len() + self.hand.len() + self.discard.len() + self.consumed.len()
    }
}
