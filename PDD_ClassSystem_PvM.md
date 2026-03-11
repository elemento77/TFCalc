# PDD (Product Definition): PvM Class System (ModernUO + Sphere)

Date: 2026-03-10
Scope: PvM-only class progression layered on top of ModernUO skill progression, calibrated to the server's Sphere pipeline.

## 1. Goals

- Add meaningful PvM progression without forcing skill templates (players can still GM-all). Base UO skills (capped at 100.0) directly scale class abilities in PvM.
- Make every class rank matter (rank 1-11 always changes a value; capstone adds a distinct spike).
- Keep PvP balance intact by isolating class effects to PvM only.
- Keep all combat math aligned to the server's Sphere combat pipeline (delay, hit, absorb, scaling).

## 2. Non-Goals

- No new PvP power system.
- No permanent changes to STR/DEX/INT, elemental resistances, or armor rating as a class mechanic.
- No `.s4` command and no extra global toggle channel beyond `.s1-.s3`.

## 3. Core Rules (Hard Requirements)

### 3.1 Player Level + Points

- Level cap: 50.
- Points gained: 1 point per level (total 50 points at level 50).
- Points are spent on class abilities (actives and passives).

### 3.2 Ability Ranks + Capstone Cost

Each ability (active or passive) has 12 ranks:

- Ranks 1-11 cost 1 point each.
- Rank 12 is the capstone and costs 4 points (extra).
- Total cost to fully max a single ability: 15 points.
- Capstone prerequisite: the ability must already be rank 11.

Implication (intended): with 50 points, a player can max 3 abilities (45 points) and still have 5 points to diversify.

### 3.3 Classes + Loadout

Baseline class set (5 classes):

- Berzerker (2H melee)
- Templar (1H + shield)
- Marksman (bows)
- Arcanist (staff/leather caster)
- Deathcaller (staff/leather necro/debuff)

Classes do not lock skills; they grant class abilities. Class abilities may reference equipment checks (ex: "requires 2H weapon") as runtime conditions.

**PvM Utility Loadout (Soft Skill Cap)**:
While players can have "GM All" for PvP, they must explicitly choose **3 to 5 skills** (from the ones they have GM'd or 120'd) in their class UI. These chosen skills grant powerful, passive PvM utility effects.

### 3.4 Commands (Player UX Contract)

- `.class`: open class UI (view class, points, ranks; spend points; respec if allowed).
- `.s1`, `.s2`, `.s3`: activate the class active skills bound to the current class.
- No `.s4`.

### 3.5 PvP Isolation (Anti-Griefing)

Definitions:

- "PvP mode" is a temporary state for a player triggered by engaging in harmful actions with another player.

Requirements:

- When a player enters PvP mode, all class bonuses that affect combat are disabled for that player immediately.
- While in PvP mode, creatures cannot deliver a lethal hit to that player:
  - Creature damage is allowed, but it must not reduce the player below 1 HP.
  - This is a safety rule against "mob tap finish" griefing during PvP.
- Class effects remain fully active in PvM mode.

Notes:

- PvP mode should have an expiry window (example: 10-20 seconds after last PvP harmful action).
- The "non-lethal mob damage in PvP mode" rule must be configurable (on/off) and must only apply when the player is in PvP mode.

## 4. Combat Math Source of Truth

This shard uses the Sphere combat pipeline. Class modifiers must be applied as modifiers on top of the existing Sphere functions:

- Swing timing: `SphereCombat.GetDelay(...)` / `SphereCombat.GetSwingPeriodSeconds(...)`
- Hit chance (if used for PvM-only mechanics): `SphereCombat.CheckHit(...)`
- Damage scaling: `SphereCombat.ScaleDamage(...)`
- Absorption: `SphereCombat.AbsorbDamage(...)`
- Spell damage scaling: `SphereCombat.GetScaledSpellDamage(...)`
- Circle cast delays: `SphereCombat.GetCircleCastDelay(...)`

Do not re-implement or fork formulas elsewhere. Class code should call into SphereCombat or inject at a single controlled hook point.

Also, class skill targeting must respect Sphere LOS rules:

- When Sphere is enabled, use `Sphere.InLineOfSight(from, target)` for target validation.

## 5. System Components (What Must Exist)

- Player progression:
  - XP, Level (0..50), unspent points, spent points.
  - Current class selection.
  - Ability ranks per class.
  - **Active Utility Skills**: A list of 3-5 chosen UO skills that grant PvM utility perks.
- Core mechanics:
  - "Ability Damage": standard damage profile used by class abilities, scaled by UO skills.
  - "Damage Types": Abilities must output strongly-typed damage (Physical, Fire, Cold, Poison, Energy) that interacts appropriately with the Sphere pipeline.
- Cooldown + activation:
  - Each active has a cooldown, optional duration, and exact resource cost (Mana, Stamina, or HP).
  - Activation checks include: PvP mode, equipment, resource cost (mana/stamina/hp), LOS, range.
- Persistence:
  - All progression data persists across server restarts.
  - Serialization versioning supports schema evolution.
- UI:
  - `.class` displays: class overview, 6 abilities, ranks, next-rank deltas, and capstone info.
  - *Utility Loadout Tab*: an interface where the player selects, verifies, and locks in their 3-5 Active Utility Skills.
  - Spending points must show the delta clearly so "each level matters" is visible to the player.

## 6. Acceptance Criteria (Testable)

- Level/points:
  - At level N, the player has exactly N total points earned (minus spent points).
  - Capstone rank purchase consumes 4 points and requires rank 11.
- Commands:
  - `.s1-.s3` activate the correct class actives; no `.s4`.
- PvP:
  - When player-vs-player harmful occurs, class bonuses stop applying immediately.
  - While in PvP mode, a creature cannot reduce the player below 1 HP.
  - When PvP mode expires, PvM bonuses resume.
- Sphere alignment:
  - Swing delay modifiers alter the delay returned by the Sphere path (not a parallel timer).
  - Armor/absorb interactions remain in the Sphere sequence unless a capstone explicitly ignores absorb for that hit.

