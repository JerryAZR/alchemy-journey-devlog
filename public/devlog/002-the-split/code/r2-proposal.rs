// AI 的提案 —— 已枪毙 ✗
/// "Security insight": derive player identity from the connection.
// !diff(1:3) -
fn player_id(conn: &Connection) -> PlayerId {
    // one player per connection, by construction
}
