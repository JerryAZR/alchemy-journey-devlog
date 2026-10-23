# COMBAT.md — Ruling 1

The core is a crate, and it is pure.

`crates/combat` owns combat state and rules. It depends on
`rand` and nothing Bevy. The crate boundary exists so that
the dependency graph itself forbids UI, wall-clock time,
and networking from creeping into combat logic.
