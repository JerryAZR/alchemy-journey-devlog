/// One node in a card's program. Cost is a property of the *node*
/// (DESIGN.md): a component's price travels with it, not with the wand —
/// a 6-damage component costs 1 wherever it is, and Eval/BindTarget are
/// components too. A cast costs the sum of the nodes it consumes, so
/// stepping wands price each cast by what it actually does.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Instruction {
    pub cost: u32,
    pub kind: InstructionKind,
}
