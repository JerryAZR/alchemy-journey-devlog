    let mut quotas: Vec<u32> = vec![1];
    let mut wraps_left = card.def.unwrap;
    let max_iterations = (card.def.unwrap as usize + 1) * effects.len();
    let mut iterations = 0;
    let mut i = card.cursor;
    loop {
        if quotas.is_empty() {
            break; // root block complete: cursor rests on the next instruction
        }
        if i == effects.len() {
            if wraps_left == 0 {
                break; // vector end: cast stops; cursor rests at 0
            }
            wraps_left -= 1;
            i = 0;
            continue;
        }
        iterations += 1;
        assert!(
            iterations <= max_iterations,
            "plan_cast exceeded its iteration bound ({max_iterations})"
        );
        match effects[i] {
            Instruction::Eval(n) => {
                // A group is one block of its parent, then pushes its own quota.
                spend_block(&mut quotas);
                quotas.push(n);
            }
            Instruction::BindTarget(spec) => {
                plan.final_bind = spec; // rides free: not a block
            }
            Instruction::Apply(atom) => {
                spend_block(&mut quotas);
                if plan.final_bind == TargetSpec::Chosen {
                    plan.needs_chosen = true;
                }
                plan.casts.push((atom, plan.final_bind));
            }
        }
        i += 1;
