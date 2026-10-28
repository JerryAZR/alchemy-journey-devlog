fn two_engines_stay_in_lockstep() {
    let (mut host, host_start) = starter_combat(7);
    let (mut guest, guest_start) = starter_combat(7);
    assert_eq!(host_start, guest_start);

    let first_living_enemy = |s: &CombatState| {
        s.enemies
            .iter()
            .position(Unit::is_alive)
            .map(|i| UnitRef::Enemy(EnemyId(i as u32)))
    };

    for _ in 0..20 {
        if host.outcome.is_some() {
            break;
        }
        // Play every playable card this turn.
        loop {
            if host.outcome.is_some() {
                break;
            }
            let player = host.player(LOCAL_PLAYER).unwrap();
            let playable = player
                .hand
                .iter()
                .position(|c| cast_cost(c) <= player.energy);
            let Some(hand_index) = playable else { break };
            let target = if cast_needs_target(&player.hand[hand_index]) {
                let Some(t) = first_living_enemy(&host) else {
                    break;
                };
                Some(t)
            } else {
                None
            };
            let action = StampedIntent {
                actor: LOCAL_PLAYER,
                intent: Intent::PlayCard { hand_index, target },
            };
            assert_eq!(host.validate(action), guest.validate(action));
