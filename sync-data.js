const fs = require('fs');
const path = require('path');

// Configuration
const SERVER_DOCS_PATH = 'C:\\Users\\menti\\Desktop\\Projetos\\Server\\docs\\ClassSystem';
const TFCALC_PATH = 'C:\\Users\\menti\\Desktop\\TFCalc';

const GDD_FILE = path.join(SERVER_DOCS_PATH, 'GDD_ClassSystem_PvM.md');
const SPECS_FILE = path.join(SERVER_DOCS_PATH, 'SkillSpecializations_PvM.md');
const INDEX_FILE = path.join(TFCALC_PATH, 'index.html');

console.log('--- TFCalc Sync Started ---');

/**
 * Parses the SkillSpecializations_PvM.md file for utility skill data.
 */
function parseSkillSpecs() {
    const content = fs.readFileSync(SPECS_FILE, 'utf8');
    const skillData = [];
    const sections = content.split('### ').slice(1);
    
    sections.forEach(section => {
        const lines = section.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) return;
        
        const nameLine = lines[0];

        // Handling grouped weapon skills
        if (nameLine.includes('Weapon Skills')) {
            const weapons = ["Swordsmanship", "Fencing", "Macing", "Archery"];
            let corePerkText = "";
            let legBreakthroughText = "";
            const weaponSpecifics = {};

            lines.forEach(line => {
                const clean = line.replace(/^[ \-*]+/, '').trim();
                if (line.includes('**Core Perk')) {
                    corePerkText = line.split('**:')[1].trim();
                } else if (line.includes('**Legendary Breakthrough')) {
                    legBreakthroughText = line.split('**:')[1].trim();
                } else if (line.includes(':') && ["Swords", "Fencing", "Macing", "Archery"].some(w => line.includes(w))) {
                    const parts = line.split(':');
                    const wName = parts[0].replace(/[ \-*]+/, '').trim();
                    const wEffect = parts[1].trim();
                    weaponSpecifics[wName] = wEffect;
                }
            });

            weapons.forEach(w => {
                const wKey = w.replace('manship', '');
                const effect = weaponSpecifics[wKey] || "";
                skillData.push({
                    name: w,
                    gm: `10% chance for ${effect} (at 100.0).`,
                    leg: w === "Macing" ? "Crit deals +50% Physical dmg (Shatter)." : legBreakthroughText
                });
            });
            return;
        }

        let gm = '';
        let leg = '';
        lines.forEach(line => {
            if (line.includes('**Core Perk')) {
                gm = line.split('**:')[1].trim();
            } else if (line.includes('**Legendary Breakthrough')) {
                leg = line.split('**:')[1].trim();
            }
        });
        
        if (nameLine && gm) {
            skillData.push({ name: nameLine, gm, leg });
        }
    });
    
    return skillData;
}

/**
 * Parses the GDD_ClassSystem_PvM.md file for class and skill data.
 */
function parseClasses() {
    const content = fs.readFileSync(GDD_FILE, 'utf8');
    const classes = [];
    
    // Split by class sections (e.g., ### 3.1 Berzerker)
    const classSections = content.split(/### \d\.\d\s+/).slice(1);
    
    classSections.forEach(section => {
        const lines = section.split('\n');
        const headerMatch = lines[0].match(/(.*?) \((.*?)\)/);
        if (!headerMatch) return;
        
        const className = headerMatch[1].trim();
        const archType = headerMatch[2].trim();
        const classObj = { name: className, archetype: archType, skills: [] };
        const idPrefix = className.toLowerCase().substring(0, 3);
        
        // Split section by skills (starting with - `.s` or - `Name`)
        const skillBlocks = section.split(/\n- /).slice(1);
        let pIdx = 1;

        skillBlocks.forEach(block => {
            const bLines = block.split('\n').map(l => l.trim()).filter(l => l);
            if (bLines.length === 0) return;
            const firstLine = bLines[0];
            
            // Shared parsing logic for rankDesc and capstone
            let rankDesc = '';
            let capName = '';
            let capDesc = '';
            
            bLines.forEach(l => {
                const clean = l.replace(/^[ \-*]+/, '').trim();
                if (clean.startsWith('Rank 1-11:')) {
                    rankDesc = clean.replace('Rank 1-11:', '').trim();
                } else if (clean.startsWith('Capstone')) {
                    const cMatch = clean.match(/Capstone \((.*?)\): (.*)/);
                    if (cMatch) { capName = cMatch[1]; capDesc = cMatch[2]; }
                }
            });

            // Active Skill
            if (firstLine.startsWith('`.s')) {
                const sMatch = firstLine.match(/`\.(s\d) (.*?)`/);
                if (!sMatch) return;
                
                const sId = sMatch[1];
                const name = sMatch[2];
                
                // Scaling data
                const dmgBonusMatch = rankDesc.match(/ability damage \+(\d+)% per rank/i);
                const cdMatch = rankDesc.match(/cooldown -([\d.]+)s per rank \(base ([\d.]+)s/i);

                classObj.skills.push({
                    id: `${idPrefix}_${sId}`,
                    name, type: `.${sId} Active`, rankDesc,
                    dmgBonus: dmgBonusMatch ? dmgBonusMatch[1] : '3',
                    cdBase: cdMatch ? cdMatch[2] : '15',
                    cdStep: cdMatch ? cdMatch[1] : '0.5',
                    capName, capDesc, rank: 0
                });
            } 
            // Passive Skill
            else if (firstLine.startsWith('`')) {
                const pMatch = firstLine.match(/`(.*?)`/);
                if (!pMatch) return;
                
                const name = pMatch[1];
                classObj.skills.push({
                    id: `${idPrefix}_p${pIdx++}`,
                    name, type: 'Passive', rankDesc,
                    capName, capDesc, rank: 0
                });
            }
        });
        
        classes.push(classObj);
    });
    
    return classes;
}

/**
 * Generates the JavaScript string for the classes array.
 */
function generateClassesJS(classes) {
    let js = 'const classes = [\n';
    classes.forEach((c, cIdx) => {
        js += `            {\n`;
        js += `                name: "${c.name}", archetype: "${c.archetype}",\n`;
        js += `                skills: [\n`;
        c.skills.forEach((s, sIdx) => {
            let getDescStr = '';
            const desc = s.rankDesc.replace(/`/g, '\\`').replace(/"/g, '\\"');
            
            if (s.type.includes('Active')) {
                let descJS = desc;
                // Specific replacements for DMG and CD
                descJS = descJS.replace(/ability damage \+\d+% per rank/i, `Dmg <span class="val-hl">+\${r * ${s.dmgBonus}}%</span>`);
                descJS = descJS.replace(/cooldown -[\d.]+s per rank \(base ([\d.]+)s.*?\)/i, `CD <span class="val-hl">\${(${s.cdBase} - (r * ${s.cdStep})).toFixed(1)}s</span>`);
                // Global replacement for any other "% per rank" patterns
                descJS = descJS.replace(/(\d+)% per rank/g, `<span class="val-hl">\${r * $1}%</span>`);
                getDescStr = `(r) => \`${descJS}\``;
            } else {
                const descJS = desc.replace(/(\d+)% per rank/g, `<span class="val-hl">\${r * $1}%</span>`);
                getDescStr = `(r) => \`${descJS}\``;
            }

            js += `                    { id: "${s.id}", name: "${s.name}", type: "${s.type}", getDesc: ${getDescStr}, capName: "${s.capName}", capDesc: "${s.capDesc.replace(/"/g, '\\"')}", rank: 0 }${sIdx < c.skills.length - 1 ? ',' : ''}\n`;
        });
        js += `                ]\n`;
        js += `            }${cIdx < classes.length - 1 ? ',' : ''}\n`;
    });
    js += '        ];';
    return js;
}

// Execution
try {
    const skillData = parseSkillSpecs();
    const classData = parseClasses();

    let html = fs.readFileSync(INDEX_FILE, 'utf8');

    // Replace Classes Array
    const classesJS = generateClassesJS(classData);
    const classesRegex = /const classes = \[[\s\S]*?\];/;
    html = html.replace(classesRegex, classesJS);

    // Replace SkillData Array (Utilities)
    let skillDataJS = 'const skillData = [\n';
    skillData.forEach((s, idx) => {
        skillDataJS += `            { name: "${s.name}", gm: "${s.gm.replace(/"/g, '\\"')}", leg: "${s.leg.replace(/"/g, '\\"')}" }${idx < skillData.length - 1 ? ',' : ''}\n`;
    });
    skillDataJS += '        ];';
    
    // Using a more lenient regex for skillData/skill_data
    const skillDataRegex = /const skill_?data = \[[\s\S]*?\];/i;
    html = html.replace(skillDataRegex, skillDataJS);

    fs.writeFileSync(INDEX_FILE, html);
    console.log('--- TFCalc Sync Completed Successfully ---');
    console.log(`Updated classes: ${classData.map(c => c.name).join(', ')}`);
    console.log(`Updated utility skills: ${skillData.length}`);

} catch (err) {
    console.error('FAILED to sync TFCalc:', err);
}
