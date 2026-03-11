# GDD (Game Design): PvM Class System (ModernUO + Sphere)

Date: 2026-03-10
Design intent: PvM power with strong identity per class, strict PvP isolation, and rank-by-rank progression that always matters.

## 1. Global Design Rules

- Level cap: 50. Points: 1 per level (50 total).
- Ability ranks:
  - Rank 1-11: 1 point each
  - Rank 12 capstone: 4 points (requires rank 11)
  - Maxing one ability: 15 points
- Each active ability must have a defined resource cost (Mana, Stamina, or HP).
- Cooldowns for active abilities should range from 15s (very powerful base) down to 5s (when fully maxed or optimally triggered).
- Each rank must change at least one value (damage %, duration, cooldown, chance, radius, etc).
- Class effects apply only against creatures (PvM). In PvP mode, class combat bonuses are disabled.
- No `.s4` command.

### 1.1 UO Skill Integration (PvM Scaling)

To ensure the "GM All" experience remains meaningful in PvM, class abilities scale based on standard UO skills (capped at 100.0) without altering the PvP balance:
- **Melee Classes (Berzerker, Templar)**: Base ability damage scales with `Tactics` and `Anatomy`. `Arms Lore` may increase cooldown reduction or utility duration.
- **Ranged Classes (Marksman)**: Base ability damage scales with `Tactics` and `Anatomy`. `Tracking` may increase utility or debuff potency.
- **Caster Classes (Arcanist, Deathcaller)**: Base ability damage scales with `Magery` and `Evaluating Intelligence`. `Spirit Speak` or `Focus` may scale minion strength or utility duration.
This scalar only applies when abilities are used "vs creatures".

### 1.2 Damage Typing & Weapon Tiers

- **Elemental Typing**: Every instance of Ability Damage is strictly typed as Physical, Fire, Cold, Poison, or Energy.
  - Physical damage explicitly targets Virtual Armor / AR.
  - Magical types target corresponding resistances (if applicable) or bypass AR entirely.
- **Weapon Tier Scaling**: For *all* active skills (including Arcanist and Deathcaller abilities), the final Ability Damage is further multiplied by the equipped weapon's magical damage tier (Ruin, Might, Force, Power, Vanquishing). High tier staves and spellbooks are vital for caster output.

### 1.3 PvM Utility Loadout (Skill Specialization / "Soft Cap")

While players can reach "GM All" in skills for PvP, the PvM class system introduces a **Soft Cap Specialization**. 
- Players use the `.class` Gump to select exactly **3 to 5 skills** (from the ones they have at 100.0/120.0).
- These chosen skills become "Active Utility Skills", granting powerful PvM-only perks that complement the class.
- *Examples*:
  - `Forensic Evaluation`: Grants bonus damage against the specific creature type currently being tracked.
  - `Taste Identification`: Enhances the duration/power of consumed potions during combat.
  - `Camping`: Turns campfires into AoE healing/rally points for the party.
  - `Begging`: Can be used to drop aggro from a primary target.

## 2. Class Roster

Each class has:

- 3 Active skills (bound to `.s1`, `.s2`, `.s3`).
- 3 Passive skills (always on).
- Each active and passive has a capstone at rank 12.

### Common Terms

- "vs creatures" means `defender is BaseCreature` and the player is not in PvP mode.
- "ignore absorb" means skipping the Sphere absorb step for that one hit (capstone-only, proc-based).
- "Ability Damage" refers to the specific damage dealt by class active skills (`.s1`, `.s2`, etc.), which is scaled by UO skills. Buffs/debuffs that affect damage done or received explicitly apply to Ability Damage as well as weapon swings and magery spells.

## 3. Classes and Skills

### 3.1 Berzerker (2H melee)

Identity: high-impact melee that trades safety for burst and tempo.

Actives:

- `.s1 Whirlwind Strike` (AoE melee)
  - Cost: 20 Stamina
  - Damage Type: **Physical** (Scales with Weapon Tier)
  - Rank 1-11: ability damage +3% per rank; cooldown -0.5s per rank (base 15s, floor 9.5s); radius 1.
  - Capstone (Vortex): Whirlwind now pulls creatures within 3 tiles into melee range before striking, and refunds 1s of cooldown per creature hit (up to 4s).
- `.s2 Bloodlust` (self buff)
  - Cost: 10 HP
  - Rank 1-11: +4% melee and physical ability damage vs creatures per rank for 12s (max +44%); cooldown -1s per rank (base 20s, floor 9s).
  - Capstone (Bloodbath): during Bloodlust, weapon critical hits or abilities vs creatures reduce the cooldown of all active skills by 1s (ICD 2s).
- `.s3 Brutal Leap` (gap close + CC)
  - Cost: 15 Stamina
  - Damage Type: **Physical** (Scales with Weapon Tier)
  - Rank 1-11: leap range +0.2 tiles per rank (cap at +2); stun duration +0.05s per rank (max +0.55s); cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Earthquake): Instead of just stunning the primary target, applies a 3-tile tremor that slows all nearby creature movement and swing speed by 30% for 5s.

Passives:

- `Heavy Momentum` (tempo)
  - Rank 1-11: reduce swing period vs creatures by 2% per rank (max 22%).
  - Capstone (Crushing Impact): 15% chance on melee hit vs creatures to ignore absorb for that hit and apply 0.5s stagger.
- `Thick Skin (PvM)` (survivability)
  - Rank 1-11: reduce damage taken from creatures by 1% per rank (max 11%).
  - Capstone (Vengeful Call): when taking a single hit > 20 damage from a creature, gain +5 stamina (internal cooldown 10s).
- `Cleave` (cleave chaining)
  - Rank 1-11: 1% per rank chance on melee hit to deal 40% splash physical damage to 1 adjacent creature, applying a minor **Bleed** tick for 3s.
  - Capstone (Great Cleave): Cleave can hit up to 2 adjacent creatures and splash damage becomes 60%.

### 3.2 Templar (1H + shield)

Identity: PvM tank/support that stabilizes groups and controls threat.

Actives:

- `.s1 Holy Shield` (block charges)
  - Cost: 15 Stamina
  - Rank 1-11: gain 1 block charge at rank 1, +1 charge at ranks 4/7/10 (max 4); duration +1s per rank; cooldown -0.5s per rank (base 20s, floor 14.5s).
  - Capstone (Aegis): Block charges no longer expire until consumed. When a charge is consumed, all party members within 5 tiles gain a 50 HP absorbtion shield for 5s.
- `.s2 Judgment` (high-damage holy strike)
  - Cost: 20 Mana
  - Damage Type: **Energy** (Holy)
  - Rank 1-11: deals heavy Energy ability damage to a single creature. Damage +4% per rank; cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Condemnation): Judgment applies a debuff causing the target to take 10% more damage from all sources for 8s. Successful parries reduce Judgment's cooldown by 1s.
- `.s3 Provoke` (taunt)
  - Cost: 10 Stamina
  - Rank 1-11: taunt duration +0.5s per rank; cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Mass Provocation): Provoke becomes an AoE (4-tile radius) and taunted creatures have their physical defense lowered, temporarily ignoring 15% of their AR absorb.

Passives:

- `Guardian's Zeal` (shield mastery)
  - Rank 1-11: +2% chance per rank to parry creature melee while a shield is equipped.
  - Capstone (Shield Slam): on a successful parry vs a creature, 20% chance to stun it for 1s (ICD 6s per attacker).
- `Retribution` (holy thorns)
  - Rank 1-11: 2% per rank chance when hit by a creature to deal holy retaliation damage (scaled) back to the attacker.
  - Capstone (Holy Chain): Retribution hits can arc to a second nearby creature for 50% damage.
- `Aura of Devotion` (stamina aura)
  - Rank 1-11: allies within 5 tiles gain +1 stamina regen per 3 ranks (rounded down) while in PvM.
  - Capstone (Divine Grace): allies affected have 10% chance to not spend stamina on weapon specials (PvM only).

### 3.3 Marksman (bows)

Identity: precision ranged DPS with control and execution.

Actives:

- `.s1 Piercing Shot` (line shot)
  - Cost: 15 Stamina
  - Damage Type: **Physical** (Scales with Weapon Tier)
  - Rank 1-11: line length +0.5 tiles per rank (max +5); ability damage +2% per rank; cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Pinning Shot): Creatures hit by the line shot are rooted in place for 2s. Hitting 3+ creatures instantly refunds 3s of cooldown.
- `.s2 Hunter's Mark` (single-target mark)
  - Cost: 10 Stamina
  - Rank 1-11: mark duration +1s per rank; marked target takes +1% damage (weapon, spell, and ability) from the Marksman per rank (PvM only); cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Shared Prey): The Marksman's damage bonus vs the marked target is shared with all party members within 8 tiles.
- `.s3 Rain of Arrows` (area volley)
  - Cost: 25 Stamina
  - Damage Type: **Physical** (Scales with Weapon Tier)
  - Rank 1-11: radius +0.1 tiles per rank (max +1); slow magnitude +2% per rank (max 22%); cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Volley Downpour): Rain of Arrows leaves behind a field of caltrops for 6s that apply a **Poison** effect and reduce creature AR absorb by 10%.

Passives:

- `Eagle Eye` (range)
  - Rank 1-11: +1 tile max bow range at ranks 2/4/6/8/10 (max +5).
  - Capstone (Point Blank): if target is within 2 tiles, 100% chance to knockback (PvM only, ICD 6s).
- `Fletcher's Luck` (ammo efficiency)
  - Rank 1-11: 1% per rank chance to not consume arrows/bolts vs creatures.
  - Capstone (Recycle): each ammo save grants +5% swing speed for the next shot (stacks up to 3, PvM only).
- `Precise Strikes` (crit/execution)
  - Rank 1-11: +1% crit chance per rank vs creatures.
  - Capstone (Executioner): targets below 20% HP take +50% crit damage from the Marksman.

### 3.4 Arcanist (staff/leather caster)

Identity: elemental burst mage with positioning tools.

Actives:

- `.s1 Arcane Nova` (AoE burst)
  - Cost: 25 Mana
  - Damage Type: **Fire** and **Energy** (Split)
  - Rank 1-11: ability damage +3% per rank; radius +0.1 per rank (max +1); cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Supernova): Arcane Nova now pulls nearby creatures slightly inward and leaves a residual field that applies **Fire** dot for 20% of the initial damage over 4s.
- `.s2 Elemental Surge` (timed buff, not a toggle)
  - Cost: 15 Mana
  - Rank 1-11: for 10s, +2% spell and ability damage vs creatures per rank; mana cost +1% per rank (risk trade); cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Stormweaver): Casting during Elemental Surge reduces the remaining cooldown of Arcane Nova and Blink by 0.5s per spell cast.
- `.s3 Blink` (mobility)
  - Cost: 15 Mana
  - Rank 1-11: blink range +0.2 tiles per rank (max +2); cooldown -0.5s per rank (base 10s, floor 4.5s).
  - Capstone (Mirror Image): Instead of a simple decoy, Blink leaves two functional mirror images that cast weak copies of your offensive spells for 4s before detonating for minor area **Cold** damage.

Passives:

- `Elemental Affinity` (element damage)
  - Rank 1-11: +1% fire/cold/energy spell damage vs creatures per rank.
  - Capstone (Elemental Resonance): casting different elements in sequence grants +20% damage to the next spell (PvM only, 8s window).
- `Quick Casting (PvM)` (cast delay)
  - Rank 1-11: reduce circle cast delay vs creatures by 1% per rank (applied to Sphere circle delays).
  - Capstone (Echo Cast): 15% chance for circle 1-2 spells to cast twice vs creatures (second cast at 50% damage).
- `Leyline Attunement` (mana sustain)
  - Rank 1-11: +1 mana regen at ranks 3/6/9; plus +1% passive mana regen per rank while in PvM.
  - Capstone (Mana Well): after standing still for 3s, passive mana regen doubles until moving (PvM only).

### 3.5 Deathcaller (staff/leather necro/summoner)

Identity: minion master that summons and empowers undead to overwhelm creatures.

Actives:

- `.s1 Ossuary Ritual` (Raise Skeleton)
  - Cost: 15 Mana, 5 HP
  - Damage Type: Skeleton melee is **Physical**
  - Rank 1-11: Summons a robust skeleton to fight for you. Maximum of 1 skeleton at rank 1, +1 max skeleton at ranks 4/8 (max 3). Base skeleton HP/Damage scales with rank. Skeletons last until killed. Cooldown 15s.
  - Capstone (Bone Armor): Skeletons spawn with bone armor that absorbs the next 3 physical hits completely. When a skeleton dies, it refunds 5s of cooldown to other active skills.
- `.s2 Dark Sacrement` (Minion Frenzy)
  - Cost: 20 Mana
  - Damage Type: Corpse Explosion is **Poison**
  - Rank 1-11: Buffs all active summons for 8s. Summons gain +2% attack speed and +2% damage per rank. Cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Corpse Explosion): Selecting a specific undead minion causes it to detonate, dealing heavy AoE **Poison** damage based on its remaining HP.
- `.s3 Curse of Decay` (AoE debuff)
  - Cost: 15 Mana
  - Rank 1-11: radius +0.1 per rank (max +1); reduces creature resistance to physical and spell damage by 1% per rank; reduces creature HP regen by 1% per rank; cooldown -0.5s per rank (base 15s, floor 9.5s).
  - Capstone (Life Leeching): Cursed creatures heal attacking undead minions for 10% of the damage dealt.

Passives:

- `Necrotic Potency` (spell power)
  - Rank 1-11: +1% spell damage vs creatures per rank.
  - Capstone (Death's Reach): 15% chance on spell hit to reduce creature STR by 10 for 5s (ICD per target 10s).
- `Essence Harvest` (mana on kill)
  - Rank 1-11: on creature kill, restore 1 + rank mana (capped per second).
  - Capstone (Soul Overflow): if mana is full, excess becomes a temporary HP shield for 10s.
- `Staff Mastery` (casting under pressure)
  - Rank 1-11: +2% per rank chance to continue meditating / avoid disruption from creature hits (PvM only).
  - Capstone (Arcane Deflection): 10% chance to reflect creature spells back at the caster.

