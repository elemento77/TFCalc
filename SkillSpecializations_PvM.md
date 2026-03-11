# Skill Specializations (PvM)

Date: 2026-03-10
System: PvM "Soft Cap" Utility Loadout
Design Paradigm: **Passive Synergy & Procs**

To reduce button-bloat and UI overload, the 3-5 chosen "Active Utility" slots within the `.class` Gump focus heavily on **procs (chance on hit/cast/struck)** and **automatic passives**. This allows players to layer effects naturally through standard gameplay. 

These benefits are disabled in PvP. Each skill has two tiers of power:
1. **Grandmaster (100.0)**: The base utility proc/passive.
2. **Legendary (120.0)**: A significant power spike or mechanical shift unlocked via Power Scrolls.

---

## 1. Combat & Melee Skills

### Tactics
- **Identity**: Maintaining offensive momentum.
- **100.0 (Grandmaster)**: "Tactical Reset" - 10% chance when struck by a creature to instantly refund 2 seconds of cooldown to all your class active abilities.
- **120.0 (Legendary)**: After resetting cooldowns this way, your next class ability deals +25% damage.

### Anatomy
- **Identity**: Finding physical weak points.
- **100.0 (Grandmaster)**: "Vital Strike" - 15% chance on melee hit to apply a Vital Strike, dealing an extra 20% of the attack's damage as Physical Ability Damage that ignores AR.
- **120.0 (Legendary)**: Vital Strikes also debilitate the creature, reducing their damage output by 10% for 4 seconds.

### Parrying
- **Identity**: Punishing attackers.
- **100.0 (Grandmaster)**: "Spiked Shield" - Successful parries have a 15% chance to reflect 30% of the creature's melee damage back as Physical Ability Damage.
- **120.0 (Legendary)**: "Phalanx" - Reflecting damage grants you a temporary HP shield equal to the amount reflected for 5 seconds.

### Weapon Skills (Swords, Fencing, Macing, Archery)
- **Identity**: Weapon-specific mastery procs.
- **100.0 (Grandmaster)**: 10% chance on standard weapon hit to trigger a weapon-specific effect:
  - *Swords*: Severe Bleed (Physical DoT).
  - *Fencing*: Armor Pierce (ignores 50% AR on the next hit).
  - *Macing*: Crushing Blow (increases your chance to land a Critical Strike by 15% for the next 3 seconds).
  - *Archery*: Pin (roots the creature in place for 1.5s).
- **120.0 (Legendary)**: "Cleaving Strikes" - The proc effect and 50% of the strike's damage splashes to a secondary nearby target. For Macing, landing a Critical Strike while Crushing Blow is active deals an additional 50% Physical Ability Damage burst.

---

## 2. Magical Arts

### Magery
- **Identity**: Endless arcane barrage.
- **100.0 (Grandmaster)**: "Arcane Echo" - 10% chance when casting any offensive spell to automatically duplicate the spell at a random nearby hostile creature for 50% damage.
- **120.0 (Legendary)**: "Archmage's Focus" - Arcane Echo casts deal 100% damage and restore 5 mana.

### Evaluating Intelligence
- **Identity**: Exposing magical flaws.
- **100.0 (Grandmaster)**: "Expose Flaw" - 15% chance on spell hit to expose a temporary Magical Flaw on the creature, reducing their resistances by 20 for 5 seconds.
- **120.0 (Legendary)**: Striking a magically flawed creature with a class ability causes an elemental detonation, dealing low AoE Ability Damage (typed to the spell used).

### Meditation
- **Identity**: Emergency reserves.
- **100.0 (Grandmaster)**: "Adrenaline Rush" - Whenever you drop below 30% Mana, automatically trigger a burst restoring 30 Mana instantly (30s Internal Cooldown).
- **120.0 (Legendary)**: Adrenaline Rush also causes your next class ability to cost 0 resources.

### Magic Resist
- **Identity**: Absorbing the elements.
- **100.0 (Grandmaster)**: "Spell Eater" - 15% chance when taking spell damage from a creature to convert 20% of the damage taken directly into HP.
- **120.0 (Legendary)**: "Aegis" - 5% chance to completely nullify incoming creature spell damage and reflect it back to them.

---

## 3. Wilderness & Investigation

### Tracking
- **Identity**: Sustained damage against familiar marks.
- **100.0 (Grandmaster)**: "Predator's Focus" - Passively grants +5% swing speed and +5% Ability Damage against the specific creature *Type* (e.g., Orc, Demon) you most recently killed.
- **120.0 (Legendary)**: 10% chance on hit against that creature type to apply "Marked for Death", forcing them to take +15% damage from all sources for 4 seconds.

### Forensic Evaluation
- **Identity**: Capitalizing on kills.
- **100.0 (Grandmaster)**: "Blood Sense" - Killing a creature instantly restores 10% of your missing HP and Stamina.
- **120.0 (Legendary)**: Blood Sense also grants +10% swing/cast speed for 5 seconds.

### Item Identification
- **Identity**: Adapting to magical fields and damage.
- **100.0 (Grandmaster)**: "Adaptive Insulation" - 10% chance when taking elemental damage (fire, poison, energy, cold) to become highly resistant (take 50% less damage) from that specific element for 4 seconds.
- **120.0 (Legendary)**: You absorb the mitigated damage directly into your Mana pool.

---

## 4. Subterfuge & Roguery

### Hiding & Stealth
- **Identity**: Elusive evasion.
- **100.0 (Grandmaster)**: "Fade" - 10% chance when taking physical damage from a creature to briefly "Fade," nullifying the hit completely and dropping all creature aggro for 1 second.
- **120.0 (Legendary)**: Fading guarantees your next attack within 4 seconds is a critical strike (or deals +50% spell damage).

### Snooping & Stealing
- **Identity**: Weakening the target while sustaining yourself.
- **100.0 (Grandmaster)**: "Thief's Reflexes" - 15% chance on melee hit to steal a burst of stamina from the creature, restoring 10 Stamina to you and slowing their next swing.
- **120.0 (Legendary)**: Also pilfers small amounts of raw gold or gems directly into your backpack on proc.

### Remove Trap
- **Identity**: Punishing pursuit.
- **100.0 (Grandmaster)**: "Tripwire" - 15% chance when a creature moves onto a tile adjacent to you to trigger a hidden snare, rooting them for 2 seconds (ICD 10s per creature).
- **120.0 (Legendary)**: The snare also explodes for moderate Fire Ability Damage.

---

## 5. Gathering, Crafting, & Persuasion

### Alchemy
- **Identity**: Explosive efficiency.
- **100.0 (Grandmaster)**: "Volatile Mix" - Throwing an Explosion Potion at a creature deals additional Fire Ability Damage based on your Alchemy skill and ignores the standard potion timer (shares a 10s cooldown).
- **120.0 (Legendary)**: "Transmutation" - 15% chance when landing a killing blow to automatically generate a random potion directly into your backpack.

### Inscription
- **Identity**: Preserving arcane power.
- **100.0 (Grandmaster)**: "Runic Preservation" - 15% chance when casting a spell to not consume reagents or mana.
- **120.0 (Legendary)**: "Glyph of Warding" - When you take lethal damage from a creature, a magical rune shatters instead, absorbing the blow and restoring 15% of your max health (5 minute cooldown).

### Poisoning
- **Identity**: Toxic proliferation.
- **100.0 (Grandmaster)**: "Toxic Coating" - 15% chance on melee hit or single-target spell cast to inflict a stacking Poison DoT on the creature.
- **120.0 (Legendary)**: "Venomous Catalyst" - Hitting a poisoned creature with a class ability consumes the poison, instantaneously dealing all of its remaining damage in a single burst.

### Taste Identification
- **Identity**: Automatic consumable injection.
- **100.0 (Grandmaster)**: "Adrenaline Surge" - 15% chance when dropping below 50% HP to automatically simulate drinking a Greater Heal potion without consuming one (20s ICD).
- **120.0 (Legendary)**: The simulated potion also grants the effects of a base level Total Refresh and Cure potion simultaneously.

### Camping
- **Identity**: Passively fortifying your ground.
- **100.0 (Grandmaster)**: "Entrenched" - Standing completely still for 3 seconds grants you a passive aura, providing +2 HP/Stam/Mana regen per second to yourself and adjacent allies until you move.
- **120.0 (Legendary)**: The aura also grants a flat 5% damage reduction against creature attacks.

### Begging
- **Identity**: Pitiable deterrence.
- **100.0 (Grandmaster)**: "Pitiable Presence" - 10% chance when targeted by a creature's spell or attack to force them to hesitate, delaying their action by 1.5 seconds.
- **120.0 (Legendary)**: The hesitating creature suffers a -25% damage penalty on their next attack.
