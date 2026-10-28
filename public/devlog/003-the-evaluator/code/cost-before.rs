/// Static card definition.
#[derive(Clone, Debug, PartialEq)]
pub struct CardDef {
    pub name: String,
    pub cost: u32,
    pub on_play: OnPlay,
    /// The flat effect program (DESIGN.md).
    pub effects: Vec<Instruction>,
    /// Within one play, the scan may return to the cast's starting cell at
    /// most this many times (shared across any future triggered sub-casts).
    /// Default 0: every cell is still scanned once per play — the catch-up
    /// lap back to the start is not a wrap — but nothing is re-scanned.
