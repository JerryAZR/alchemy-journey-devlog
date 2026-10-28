## The effect IR (the decision that took the longest — do not re-litigate)

- **One IR, one tree-walking interpreter.** Spells and potions share the
  atomic effect vocabulary and the executor.
- **Two compilers, one executor:** potions lower mechanically from their
  authoring type `{ scope, effects }` into the IR; spells compile from
  sequential Noita-style evaluation into the same IR.
- **The interpreter walks the tree against live combat state.** No batching,
  no snapshot semantics: conditionals ("deal 3N; if target alive, deal N to
  yourself") and liveness checks are evaluated mid-walk. "Deal N twice" is
  two `Damage` atoms and is *not* "deal 2N."
- The IR is an **open type that grows with features**. Step 2 adds only what
  Strike/Defend need: atoms (Damage, Block), `Sequence`, and target binding
  (`WithTarget`). Modifiers/multicast/triggers/conditionals are added when
  spell assembly is designed, not before.
