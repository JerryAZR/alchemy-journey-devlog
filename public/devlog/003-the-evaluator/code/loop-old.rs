    let mut budget: u32 = 1;
    let mut applied: u32 = 0;
    let mut wraps_left = card.def.unwrap;
    let mut i = card.cursor.min(effects.len());
    loop {
        // !mark
        if i >= effects.len() {
            if wraps_left == 0 {
                break; // vector end: cast stops; cursor rests at 0
            }
            wraps_left -= 1;
            i = 0;
            continue;
        }
        match effects[i] {
            Instruction::Eval(n) => {
                // !mark
                budget = n;
                plan.steps.push(i);
            }
            Instruction::BindTarget(spec) => {
                plan.final_bind = Some(spec);
                plan.steps.push(i);
            }
            Instruction::ClearBind => {
                plan.final_bind = None;
                plan.steps.push(i);
            }
            Instruction::Apply(_) => {
                // !mark
                if applied >= budget {
                    break; // budget spent: cursor rests on this unconsumed instruction
                }
                applied += 1;
                if plan.final_bind.is_none() {
                    plan.needs_chosen = true;
                }
                plan.steps.push(i);
            }
        }
        i += 1;
    }
