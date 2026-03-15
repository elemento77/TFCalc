import re
import os

# Configuration
SERVER_DOCS_PATH = r'C:\Users\menti\Desktop\Projetos\Server\docs\ClassSystem'
TFCALC_PATH = r'C:\Users\menti\Desktop\TFCalc'

GDD_FILE = os.path.join(SERVER_DOCS_PATH, 'GDD_ClassSystem_PvM.md')
SPECS_FILE = os.path.join(SERVER_DOCS_PATH, 'SkillSpecializations_PvM.md')
INDEX_FILE = os.path.join(TFCALC_PATH, 'index.html')

def parse_skill_specs():
    with open(SPECS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    skill_data = []
    sections = content.split('### ')[1:]
    
    for section in sections:
        lines = [l.strip() for l in section.split('\n') if l.strip()]
        if not lines:
            continue
            
        name_line = lines[0]
        
        # Special handling for Weapon Skills grouping
        if "Weapon Skills" in name_line:
            weapons = ["Swordsmanship", "Fencing", "Macing", "Archery"]
            core_perk = ""
            leg_breakthrough = ""
            
            weapon_specifics = {}
            for line in lines:
                if "**Core Perk" in line:
                    core_perk = line.split('**:')[1].strip()
                elif "**Legendary Breakthrough" in line:
                    leg_breakthrough = line.split('**:')[1].strip()
                elif ':' in line and any(w in line for w in ["Swords", "Fencing", "Macing", "Archery"]):
                    parts = line.split(':')
                    w_name = parts[0].strip(' -*')
                    w_effect = parts[1].strip()
                    weapon_specifics[w_name] = w_effect
            
            for w in weapons:
                w_key = w.replace('manship', '') # Map Swordsmanship -> Swords
                effect = weapon_specifics.get(w_key, "")
                gm_desc = f"10% chance for {effect} (at 100.0)."
                leg_desc = leg_breakthrough
                if w == "Macing":
                    leg_desc = "Crit deals +50% Physical dmg (Shatter)."
                
                skill_data.append({
                    "name": w,
                    "gm": gm_desc,
                    "leg": leg_desc
                })
            continue

        gm = ""
        leg = ""
        for line in lines:
            if "**Core Perk" in line:
                gm = line.split('**:')[1].strip()
            elif "**Legendary Breakthrough" in line:
                leg = line.split('**:')[1].strip()
        
        if name_line and gm:
            skill_data.append({
                "name": name_line,
                "gm": gm,
                "leg": leg
            })
            
    return skill_data

def parse_classes():
    with open(GDD_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
        
    classes = []
    # Split by class sections (e.g., ### 3.1 Berzerker)
    class_sections = re.split(r'### \d\.\d\s+', content)[1:]
    
    for section in class_sections:
        lines = section.split('\n')
        header_match = re.search(r'(.*?) \((.*?)\)', lines[0])
        if not header_match:
            continue
            
        class_name = header_match.group(1).strip()
        arch_type = header_match.group(2).strip()
        class_obj = {"name": class_name, "archetype": arch_type, "skills": []}
        id_prefix = class_name.lower()[:3]
        
        # Split section by skills (starting with - `.s` or - `Name`)
        skill_blocks = section.split('\n- ')[1:]
        p_idx = 1
        
        for block in skill_blocks:
            b_lines = [l.strip() for l in block.split('\n') if l.strip()]
            if not b_lines:
                continue
            first_line = b_lines[0]
            
            # Active Skill
            if first_line.startswith('`.s'):
                s_match = re.search(r'`\.(s\d) (.*?)`', first_line)
                if not s_match:
                    continue
                    
                s_id = s_match.group(1)
                name = s_match.group(2)
                rank_desc = ""
                cap_name = ""
                cap_desc = ""
                
                for l in b_lines:
                    if l.strip(' -*').startswith('Rank 1-11:'):
                        rank_desc = l.strip(' -*').replace('Rank 1-11:', '').strip()
                    elif l.strip(' -*').startswith('Capstone'):
                        c_match = re.search(r'Capstone \((.*?)\): (.*)', l.strip(' -*'))
                        if c_match:
                            cap_name = c_match.group(1)
                            cap_desc = c_match.group(2)
                
                # Extraction values for JS generation
                dmg_bonus_match = re.search(r'ability damage \+(\d+)% per rank', rank_desc, re.I)
                cd_match = re.search(r'cooldown -([\d.]+)s per rank \(base ([\d.]+)s', rank_desc, re.I)
                
                class_obj["skills"].append({
                    "id": f"{id_prefix}_{s_id}",
                    "name": name,
                    "type": f".{s_id} Active",
                    "rankDesc": rank_desc,
                    "dmgBonus": dmg_bonus_match.group(1) if dmg_bonus_match else "3",
                    "cdBase": cd_match.group(2) if cd_match else "15",
                    "cdStep": cd_match.group(1) if cd_match else "0.5",
                    "capName": cap_name,
                    "capDesc": cap_desc
                })
            # Passive Skill
            elif first_line.startswith('`'):
                p_match = re.search(r'`(.*?)`', first_line)
                if not p_match:
                    continue
                    
                name = p_match.group(1)
                rank_desc = ""
                cap_name = ""
                cap_desc = ""
                
                for l in b_lines:
                    if l.strip(' -*').startswith('Rank 1-11:'):
                        rank_desc = l.strip(' -*').replace('Rank 1-11:', '').strip()
                    elif l.strip(' -*').startswith('Capstone'):
                        c_match = re.search(r'Capstone \((.*?)\): (.*)', l.strip(' -*'))
                        if c_match:
                            cap_name = c_match.group(1)
                            cap_desc = c_match.group(2)
                            
                class_obj["skills"].append({
                    "id": f"{id_prefix}_p{p_idx}",
                    "name": name,
                    "type": "Passive",
                    "rankDesc": rank_desc,
                    "capName": cap_name,
                    "capDesc": cap_desc
                })
                p_idx += 1
                
        classes.append(class_obj)
        
    return classes

def generate_classes_js(classes):
    js = "      const classes = [\n"
    for c_idx, c in enumerate(classes):
        js += "            {\n"
        js += f'                name: "{c["name"]}", archetype: "{c["archetype"]}",\n'
        js += "                skills: [\n"
        for s_idx, s in enumerate(c["skills"]):
            get_desc_str = ""
            desc = s["rankDesc"].replace('`', '\\`').replace('"', '\\"')
            
            if "Active" in s["type"]:
                desc_js = desc
                desc_js = re.sub(r'ability damage \+(\d+)% per rank', f'Dmg <span class="val-hl">+${{r * {s["dmgBonus"]}}}%</span>', desc_js, flags=re.I)
                desc_js = re.sub(r'cooldown -([\d.]+)s per rank \(base ([\d.]+)s.*?\)', f'CD <span class="val-hl">${{({s["cdBase"]} - (r * {s["cdStep"]})).toFixed(1)}}s</span>', desc_js, flags=re.I)
                desc_js = re.sub(r'(\d+)% per rank', r'<span class="val-hl">${r * \1}%</span>', desc_js)
                get_desc_str = f"(r) => `{desc_js}`"
            else:
                desc_js = re.sub(r'(\d+)% per rank', r'<span class="val-hl">${r * \1}%</span>', desc)
                get_desc_str = f"(r) => `{desc_js}`"
                
            js += f'                    {{ id: "{s["id"]}", name: "{s["name"]}", type: "{s["type"]}", getDesc: {get_desc_str}, capName: "{s["capName"]}", capDesc: "{s["capDesc"].replace('"', '\\"')}", rank: 0 }}'
            if s_idx < len(c["skills"]) - 1:
                js += ","
            js += "\n"
        js += "                ]\n"
        js += "            }"
        if c_idx < len(classes) - 1:
            js += ","
        js += "\n"
    js += "        ];"
    return js

def main():
    print("--- TFCalc Python Sync Started ---")
    skill_data = parse_skill_specs()
    class_data = parse_classes()
    
    with open(INDEX_FILE, 'r', encoding='utf-8') as f:
        html = f.read()
        
    classes_js = generate_classes_js(class_data)
    html = re.sub(r'const classes = \[[\s\S]*?\];', classes_js, html)
    
    skill_data_js = "const skillData = [\n"
    for idx, s in enumerate(skill_data):
        skill_data_js += f'            {{ name: "{s["name"]}", gm: "{s["gm"].replace('"', '\\"')}", leg: "{s["leg"].replace('"', '\\"')}" }}'
        if idx < len(skill_data) - 1:
            skill_data_js += ","
        skill_data_js += "\n"
    skill_data_js += "        ];"
    
    html = re.sub(r'const skill_?data = \[[\s\S]*?\];', skill_data_js, html, flags=re.I)
    
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("--- TFCalc Sync Completed Successfully ---")
    print(f"Updated classes: {', '.join([c['name'] for c in class_data])}")
    print(f"Updated utility skills: {len(skill_data)}")

if __name__ == "__main__":
    main()
