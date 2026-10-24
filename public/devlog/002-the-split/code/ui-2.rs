// src/ui/mod.rs —— End Turn 按钮
bar.spawn((
    text_button("End Turn", 130.0, 56.0, Color::srgb(0.5, 0.4, 0.15)),
    observe(|_: On<Activate>, mut combat: ResMut<Combat>| {
        // !mark(1:2)
        combat.0.end_player_turn();
        // !callout[18:32] 游戏流程由按钮回调驱动
        combat.0.run_enemy_turn();
    }),
));
