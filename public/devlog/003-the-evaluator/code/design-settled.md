## The effect IR and evaluator (settled — do not re-litigate)

- **One IR, one executor.** Spells and potions share the atomic effect
  vocabulary and the evaluator.
- **Flat instruction vector + stateful sequential evaluator.** The editing
  surface is a vector, so the IR mirrors the authoring model — no tree, no
  compiler that reshapes one. The evaluator scans the vector against **live
  combat state**: no batching, no snapshot semantics; liveness is checked
  per atom application, mid-scan. "Deal N twice" is two `Damage` atoms and
  is *not* "deal 2N."

