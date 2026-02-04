## JSON Structure Overview

This JSON represents parsed data from a **Team Fortress 2 (TF2) demo file** (`HL2DEMO` format). It captures match metadata, player information, chat logs, kill/death events, rounds, and timing details. The root is an **object** with the following top-level keys:

| Key | Type | Description |
|-----|------|-------------|
| `header` | Object | Demo file metadata (e.g., version, server, map). |
| `chat` | Array | Chat messages with timestamps (ticks). |
| `users` | Object | Player profiles, keyed by `userId` (stringified numbers, e.g., `"4108"`). |
| `deaths` | Array | Kill events with details on killer, victim, weapon, and assists. |
| `rounds` | Array | Round summaries (e.g., winner, duration). |
| `startTick` | Number | Starting tick of the demo (e.g., `48640`). |
| `intervalPerTick` | Number | Time per tick in seconds (e.g., `0.015`). |
| `pauses` | Array | Empty in this example; likely pause events. |

---

## Detailed Schema

### `header` (Object)
Static demo info:

```json
{
  "demo_type": "string",  // e.g., "HL2DEMO"
  "version": "number",    // e.g., 3
  "protocol": "number",   // e.g., 24
  "server": "string",     // e.g., "169.254.125.6:62152"
  "nick": "string",       // Recorder's nickname, e.g., "Dog Of War Nyak"
  "map": "string",        // e.g., "pl_borneo"
  "game": "string",       // e.g., "tf"
  "duration": "number",   // Total duration in seconds, e.g., 602.355
  "ticks": "number",      // Total ticks, e.g., 40157
  "frames": "number",     // Total frames, e.g., 39416
  "signon": "number"      // Sign-on byte offset, e.g., 356830
}
```

### `chat` (Array of Objects)
Chat messages, sorted by `tick`. Each item:

```json
{
  "kind": "string",       // Chat type, e.g., "TF_Chat_All", "TF_Chat_AllDead", "TF_Chat_Team"
  "from": "string",       // Sender's name, e.g., "Kay"
  "text": "string",       // Message content (often in Russian/slang)
  "tick": "number"        // Timestamp in ticks, e.g., 30639
}
```

<details>
<summary><strong>Examples (truncated)</strong></summary>

- `"kind": "TF_Chat_AllDead", "from": "Kay", "text": "хэви с читами"`
- `"kind": "TF_Chat_All", "from": "ЗАТКНИ ПИВОРЕЗКУ", "text": "хуесос с кунаем"`

</details>

### `users` (Object)
Keyed by `userId` (string, e.g., `"4108"`). Each value:

```json
{
  "classes": "object",    // Class stats: { "classId": count }, classIds 0-9 (TF2 classes: Scout=0, Sniper=9, etc.)
  "name": "string",       // Player name, e.g., "Kay"
  "userId": "number",     // Numeric ID, e.g., 4242
  "steamId": "string",    // SteamID64 format, e.g., "[U:1:1016067724]"
  "team": "string"        // "red", "blue", or "other" (spectator?)
}
```

<details>
<summary><strong>Class IDs Reference (TF2 Standard)</strong></summary>

| ID | Class     |
|----|-----------|
| 0  | Scout    |
| 1  | Soldier  |
| 2  | Pyro     |
| 3  | Demoman  |
| 4  | Heavy    |
| 5  | Engineer |
| 6  | Medic    |
| 7  | Sniper   |
| 8  | Spy      |
| 9  | Unknown/Unused |

Example: `"classes": { "8": 7 }` → 7 Spy plays.

</details>

### `deaths` (Array of Objects)
Kill events, sorted by `tick`. Each item:

```json
{
  "weapon": "string",     // Weapon name, e.g., "kunai", "blackbox", "world" (environmental)
  "victim": "number",     // Victim `userId`, e.g., 4229
  "assister": "number|null",  // Assister `userId` or null
  "killer": "number",     // Killer `userId`, e.g., 4242
  "tick": "number"        // Tick of death
}
```

<details>
<summary><strong>Common Weapons (truncated examples)</strong></summary>

- Melee: `"kunai"`, `"battleaxe"`, `"ubersaw"`
- Primary: `"flamethrower"`, `"minigun"`, `"sniperrifle"`, `"blackbox"`
- Secondary: `"pep_pistol"`, `"flaregun"`
- Other: `"world"` (fall damage?), `"obj_minisentry"` (sentry gun)

Total ~200 events in this demo.

</details>

### `rounds` (Array of Objects)
Match rounds (1 round here):

```json
{
  "winner": "string",     // "red" or "blue"
  "length": "number",     // Duration in seconds, e.g., 621.08997
  "end_tick": "number"    // Ending tick, e.g., 38392
}
```

### Timing Fields
- **`startTick`**: Integer tick where demo analysis begins (48640).
- **`intervalPerTick`**: Float; convert ticks to time: `time = tick * intervalPerTick`.
- **`pauses`**: Array (empty); likely `{ "start": tick, "end": tick }` objects.

---

## Usage Notes
- **Ticks**: Primary timestamp. Full duration ≈ `ticks * intervalPerTick` (here: 40157 × 0.015 ≈ 602s).
- **Teams**: Red vs. Blue; cross-reference `users.team` with events.
- **Player Linking**: Use `users[userId].name` for names; `classes` for playtime stats.
- **Data Volume**: ~30 users, 28 chat msgs, 200+ deaths, 1 round.
- **TF2 Context**: Payload map (`pl_borneo`), casual/chaos match with trash talk (Russian insults, cheat accusations).

This schema is consistent and extensible for TF2 demo parsers.