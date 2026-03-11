# Tech Guide: PvM Class System (ModernUO + Sphere)

Date: 2026-03-10
Target: ModernUO server running Sphere pipeline (`SphereConfiguration.Enabled = true`).

This document describes a technical implementation that matches:

- PDD: `Docs/ClassSystem/PDD_ClassSystem_PvM.md`
- GDD: `Docs/ClassSystem/GDD_ClassSystem_PvM.md`

## 1. Key Constraints (Do Not Violate)

- Level cap 50, 50 points total.
- Capstone costs 4 points (rank 12), requires rank 11.
- No `.s4` command.
- PvP isolation: class bonuses disabled in PvP mode.
- Anti-grief: while in PvP mode, creatures cannot reduce the player below 1 HP.
- All combat adjustments must go through Sphere pipeline; do not reimplement formulas.

## 2. Where Sphere.cs Matters

`Projects/UOContent/Sphere/Sphere.cs` provides Sphere-consistent helpers that class skills should use:

- LOS: use `Sphere.InLineOfSight(from, target)` for class skill targeting when Sphere is enabled.
  - This intentionally ignores GM access bypass and matches Sphere spell behavior.
- Optional hit/miss messages:
  - `Sphere.SendHitMessage(attacker, defender)`
  - `Sphere.SendMissMessage(attacker, defender)`
  - Only use for class skills that explicitly want Sphere-style messaging; avoid spamming.

## 3. Suggested Script Layout (Within This Repo)

Create a dedicated folder under `Projects/UOContent` to keep the system isolated:

```text
Projects/UOContent/ClassSystem/
  Core/
    ClassConfig.cs            // tuning values, timings, boss definition
    ClassState.cs             // per-player state (level, xp, points, ranks)
    ClassManager.cs           // main API (get state, spend points, respec)
    PvPModeTracker.cs         // PvP mode timestamps + rules
  Combat/
    ClassCombat.cs            // centralized entry points used by hooks
  Commands/
    ClassCommands.cs          // .class, .s1, .s2, .s3
  UI/
    ClassGump.cs              // .class UI (optional in phase 1)
  Classes/
    Berzerker.cs
    Templar.cs
    Marksman.cs
    Arcanist.cs
    Deathcaller.cs
```

Keep all public surface area in `ClassManager` and `ClassCombat`. Everything else should be internal to the folder.

## 4. Data Model + Persistence

Per-player state must include:

- `ClassId` (enum)
- `Level` (0..50)
- `Xp` (long)
- `UnspentPoints` (0..50)
- Ability ranks:
  - store ranks per class (so respec/class swap can preserve or reset based on your rules)
- `ActiveUtilitySkills` (List<SkillName>): Stores the 3-5 UO skills chosen by the player to grant PvM utility perks.
- Cooldowns and active-buff expirations (for `.s1-.s3`)
- PvP mode:
  - `LastPvPHarmfulAt` timestamp
  - `IsInPvPMode(now)` computed with a configurable timeout window

Persistence approach:

- Serialize on `PlayerMobile` (ModernUO serialization generator) or attach a dedicated component class referenced by `PlayerMobile`.
- Version the serialized schema (int version + conditional reads).

## 5. PvP Mode Detection + Isolation

Definition (recommended):

- Player enters PvP mode when they perform a harmful action against a `PlayerMobile`, or receive a harmful action from a `PlayerMobile`.
- PvP mode expires `N` seconds after the last PvP harmful event (recommend 15s).

Isolation rules:

- If attacker is in PvP mode, class damage/tempo modifiers do not apply at all.
- If defender is a player and attacker is a player, do not apply any class effect (hard gate).

Anti-grief rule (non-lethal mob damage during PvP mode):

- If `defender` is in PvP mode and `attacker is BaseCreature`, then clamp final damage so it cannot reduce `defender.Hits` below 1.
- Implement as a final step just before applying damage (or immediately after computing final damage but before calling `defender.Damage(...)`).

## 6. Combat Hook Points (Sphere Pipeline)

### 6.1 Melee Swing Delay

Goal: apply PvM-only swing period reductions (example: Berzerker Heavy Momentum) without bypassing Sphere.

Constraint: the server schedules next swing via the delay returned by `weapon.OnSwing(attacker, defender)` (which ultimately uses Sphere delay when Sphere is enabled).

Recommended hook:

- In the Sphere-enabled path, compute base delay via `SphereCombat.GetDelay(weapon, attacker)`.
- If `attacker` is a player, `defender` is a creature, and attacker is not in PvP mode:
  - multiply the delay by `(1 - classSwingBonus)` where `classSwingBonus` is derived from ranks (max 22%).
- Return the modified delay so `NextCombatTime` scheduling stays correct.

### 6.2 Hit Chance

Default: do not modify hit chance unless a class explicitly requires it, and never in PvP.

If a PvM-only hit-chance modifier is added:

- Apply it as a modifier around `SphereCombat.CheckHit(attacker, defender, weapon)`, and only when `defender is BaseCreature` and attacker not in PvP mode.

### 6.3 Damage + Absorb

Rule: preserve the Sphere sequence:

1. compute base damage (or Base Ability Damage for class active skills)
2. apply Sphere scaling (`SphereCombat.ScaleDamage`)
   - **For Ability Damage**: 
     - First scale the base damage using the caster's relevant UO skills (Tactics/Anatomy for physical, Magery/EvalInt for magical). 
     - Next, read the attacker's equipped weapon `DamageLevel` (Ruin, Might, Force, Power, Vanq). Apply a predetermined flat multiplier based on that tier, benefiting both physical and elemental abilities.
     - Finally, apply this combined PvM-only scalar before sending to `ScaleDamage`.
3. apply absorb (`SphereCombat.AbsorbDamage`) unless a capstone explicitly ignores absorb for that hit
   - *Note: Ensure Elemental Damage Types (Fire, Cold, Poison, Energy) correctly bypass physical AR or check elemental resistances if the shard employs them.*
4. apply final damage to the defender

Where to inject class damage modifiers:

- Apply class damage multipliers before absorb, so armor still matters.
- For "ignore absorb" procs (capstones):
  - either skip `AbsorbDamage` for that hit, or treat AR/VirtualArmor as 0 for that absorb call.

### 6.4 Spell Damage + Cast Delays

Use Sphere helpers:

- Spell damage scaling: `SphereCombat.GetScaledSpellDamage(caster, minDamage, maxDamage)`
- Circle cast delays: `SphereCombat.GetCircleCastDelay(circle)`

Apply class modifiers only for PvM:

- If a spell is targeting a creature (or its damage recipient is a creature), apply the class multiplier.
- For Quick Casting (PvM), apply a multiplier to the circle delay only in PvM contexts.

## 7. Boss Definition (for Marksman Capstone)

You need a deterministic "boss" predicate used only for PvM bonuses (not for loot):

Recommended (configurable):

- `isBoss = defender is BaseChampion || defender is Harrower || defender.GetType().Name in {\"DemonKnight\"}` plus optional `Fame >= 10000`.

Put the actual predicate in `ClassConfig` so design can adjust without rewriting logic.

## 8. Skill Activation (Targeting + Validation)

For active skills (`.s1-.s3`):

- Validate PvP mode (must be false).
- Validate target:
  - range checks
  - LOS:
    - if Sphere enabled: `Sphere.InLineOfSight(from, target)`
- Validate equipment gates where required (2H, shield, bow, staff).
- **Resource exactment**: Validate and consume required Mana, Stamina, or HP. If insufficient, refund cooldown and alert player.
- Start cooldown timer and apply effect.

## 9. Minimal Manual Test Plan

- Progression:
  - gain XP, level up, get 1 point per level, cap at 50
  - spend ranks 1-11, then capstone consumes 4 points
- PvP isolation:
  - start PvP with another player; verify class bonuses stop immediately
  - while in PvP mode, let a creature hit you at low HP; confirm it cannot kill you (stops at 1 HP)
  - after PvP timeout, bonuses resume vs creatures
- Sphere alignment:
  - verify swing speed bonuses change actual swing interval (NextCombatTime), not animations only
  - verify absorb is preserved unless "ignore absorb" proc triggers

