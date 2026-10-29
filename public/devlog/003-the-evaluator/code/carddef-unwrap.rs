/// Static card definition.
#[derive(Clone, Debug, PartialEq)]
pub struct CardDef {
    pub name: String,
    pub cost: u32,
    pub on_play: OnPlay,
    /// The flat effect program (DESIGN.md).
    pub effects: Vec<Instruction>,
    /// Within one play, the cursor may pass slot 0 at most this many times
    /// (shared across any future triggered sub-casts). Default 0: a cast
    /// never wraps; the cursor only cycles *between* casts.
    // !mark
    pub unwrap: u8,
}
