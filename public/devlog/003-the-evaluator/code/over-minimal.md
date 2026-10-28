## Step-2 content decisions (ruled by the owner)

- **`CombatOver`, minimal**: `CombatState.outcome: Option<CombatOutcome>` set
  the moment the last enemy dies; `CombatOver { outcome }` emitted once;
  `validate` then rejects everything (`RejectReason::CombatOver`). App shows
  the outcome and returns to menu. Proper post-combat flow is designed with
  rooms & map traversal (possibly extended again with rewards).
- **Deferred with post-combat flow**: the loss path (`CombatOutcome` ships
  with `Victory` only; `Defeat` lands when enemy damage does, step 3+) and
  the run-state writeback API — neither is e2e-testable until multiple
