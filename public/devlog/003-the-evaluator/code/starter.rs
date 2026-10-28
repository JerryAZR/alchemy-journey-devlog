/// 1-1-2) and 4× stepping defend (5-12-25, costing 1-2-3) — reusable-toggle
/// potions with hand-written instruction vectors — plus two true potions
/// authored via `PotionDef` lowering. One inert dummy, 30 HP.
pub fn starter_combat(seed: u64) -> (CombatState, Vec<Event>) {
    let strike = |id: u32| {
        Card::new(
            id,
            CardDef {
                name: "Strike Draught".to_string(),
                on_play: OnPlay::Reusable,
                effects: vec![
                    Instruction::apply(Atom::Damage(6), 1),
                    Instruction::apply(Atom::Damage(9), 1),
                    Instruction::apply(Atom::Damage(15), 2),
                ],
                unwrap: 0,
            },
        )
    };
    let defend = |id: u32| {
        Card::new(
            id,
            CardDef {
                name: "Ward Draught".to_string(),
                on_play: OnPlay::Reusable,
                effects: vec![
                    Instruction::bind(TargetSpec::Caster, 0),
                    Instruction::apply(Atom::Block(5), 1),
                    Instruction::apply(Atom::Block(12), 2),
                    Instruction::apply(Atom::Block(25), 3),
                ],
                unwrap: 0,
            },
        )
    };
    let potion = |id: u32, name: &str, def: PotionDef| {
        Card::new(
            id,
            CardDef {
