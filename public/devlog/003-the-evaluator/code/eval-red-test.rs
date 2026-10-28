fn cast_stops_when_its_quota_is_spent() {
    let card = Card::new(
        0,
        CardDef {
            name: "Early Eval".to_string(),
            on_play: OnPlay::Reusable,
            effects: vec![
                Instruction::apply(Atom::Damage(1), 0),
                Instruction::eval(2, 0),
                Instruction::apply(Atom::Damage(1), 0),
                Instruction::apply(Atom::Damage(1), 0),
            ],
            unwrap: 0,
        },
    );
    let mut s = starter_with(vec![card]);
    play_at(&mut s, LOCAL_PLAYER, 0, Some(UnitRef::Enemy(EnemyId(0))));
    assert_eq!(s.enemies[0].hp, 29);
}
