/// The host gate: a read-only legality check.
/// Engines never process actions that haven't passed this.
pub fn validate(&self, action: StampedIntent) -> Result<(), RejectReason> {
    // ...
}

// !mark(1:6)
/// The engine's one input door: processes an *approved* action,
/// resolving all machinery synchronously and returning every
/// consequence as events, in order.
pub fn process(&mut self, action: StampedIntent) -> Vec<Event> {
    // ...
}
