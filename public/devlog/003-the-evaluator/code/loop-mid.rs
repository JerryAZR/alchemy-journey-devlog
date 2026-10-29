    let mut scan = ScanCursor::new(card.cursor, effects.len());
    let mut budget: u32 = 1;
    loop {
        let i = scan.position();
        match effects[i] {
            Instruction::Eval(n) => {
                // A group spends one block of its parent, then adds its own.
                budget = budget - 1 + n;
            }
            Instruction::BindTarget(spec) => {
                plan.final_bind = spec; // rides free: not a block
            }
            Instruction::Apply(atom) => {
                budget -= 1;
                if plan.final_bind == TargetSpec::Chosen {
                    plan.needs_chosen = true;
                }
                plan.casts.push((atom, plan.final_bind));
            }
        }
        scan.advance();
        // !mark(1:2)
        if budget == 0 || scan.wraps() > u32::from(card.def.unwrap) {
            break;
        }
    }
    plan.resting_cursor = scan.position();
    plan
}
