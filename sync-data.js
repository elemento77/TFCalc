const fs = require('fs');
const path = require('path');

// Configuration
const SERVER_DOCS_PATH = 'C:\\Users\\menti\\Desktop\\Projetos\\Server\\docs\\ClassSystem';
const TFCALC_PATH = 'C:\\Users\\menti\\Desktop\\TFCalc';

const GDD_FILE = path.join(SERVER_DOCS_PATH, 'GDD_ClassSystem_PvM.md');
const SPECS_FILE = path.join(SERVER_DOCS_PATH, 'SkillSpecializations_PvM.md');
const INDEX_FILE = path.join(TFCALC_PATH, 'index.html');

console.log('--- TFCalc Sync Started ---');

// 1. Parse SkillSpecializations_PvM.md for skillData
function parseSkillSpecs() {
    const content = fs.readFileSync(SPECS_FILE, 'utf8');
    const skillData = [];
    const sections = content.split('### ').slice(1);
    
    sections.forEach(section => {
        const lines = section.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 3) return;
        
        const name = lines[0];
        let gm = '';
        let leg = '';
        
        lines.forEach(line => {
            if (line.includes('**Core Perk')) {
                gm = line.split('**:')[1].trim();
            } else if (line.includes('**Legendary Breakthrough')) {
                leg = line.split('**:')[1].trim();
            }
        });
        
        if (name && gm) {
            skillData.push({ name, gm, leg });
        }
    });
    
    return skillData;
}

// 2. Parse GDD_ClassSystem_PvM.md for classes
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
            const firstLine = bLines[0];
            
            // Active Skill
            if (firstLine.startsWith('`.s')) {
                const sMatch = firstLine.match(/`\.(s\d) (.*?)`/);
                if (!sMatch) return;
                
                const sId = sMatch[1];
                const name = sMatch[2];
                let rankDesc = '';
                let capName = '';
                let capDesc = '';
                
                bLines.forEach(l => {
                    if (l.startsWith('- Rank 1-11:')) rankDesc = l.replace('- Rank 1-11:', '').trim();
                    if (l.startsWith('- Capstone')) {
                        const cMatch = l.match(/- Capstone \((.*?)\): (.*)/);
                        if (cMatch) { capName = cMatch[1]; capDesc = cMatch[2]; }
                    }
                });

                // Scaling logic
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
                let rankDesc = '';
                let capName = '';
                let capDesc = '';
                
                bLines.forEach(l => {
                    if (l.startsWith('- Rank 1-11:')) rankDesc = l.replace('- Rank 1-11:', '').trim();
                    if (l.startsWith('- Capstone')) {
                        const cMatch = l.match(/- Capstone \((.*?)\): (.*)/);
                        if (cMatch) { capName = cMatch[1]; capDesc = cMatch[2]; }
                    }
                });

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

// 3. Generate JS String for Classes
function generateClassesJS(classes) {
    let js = 'const classes = [\n';
    classes.forEach((c, cIdx) => {
        js += `            {\n`;
        js += `                name: "${c.name}", archetype: "${c.archetype}",\n`;
        js += `                skills: [\n`;
        c.skills.forEach((s, sIdx) => {
            let getDescStr = '';
            if (s.type.includes('Active')) {
                getDescStr = `(r) => \`${s.rankDesc.replace(/ability damage \+\d+% per rank/i, `Dmg <span class="val-hl">+\${r * ${s.dmgBonus}}%</span>`).replace(/cooldown -[\d.]+s per rank \(base [\d.]+s.*?\)/i, `CD <span class="val-hl">\${(${s.cdBase} - (r * ${s.cdStep})).toFixed(1)}s</span>`)}\``;
            } else {
                getDescStr = `(r) => \`${s.rankDesc.replace(/(\d+)% per rank/g, `<span class="val-hl">\${r * $1}%</span>`)}\``;
            }

            js += `                    { id: "${s.id}", name: "${s.name}", type: "${s.type}", getDesc: ${getDescStr}, capName: "${s.capName}", capDesc: "${s.capDesc}", rank: 0 }${sIdx < c.skills.length - 1 ? ',' : ''}\n`;
        });
        js += `                ]\n`;
        js += `            }${cIdx < classes.length - 1 ? ',' : ''}\n`;
    });
    js += '        ];';
    return js;
}

// 4. Update index.html
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
        skillDataJS += `            { name: "${s.name}", gm: "${s.gm}", leg: "${s.leg}" }${idx < skillData.length - 1 ? ',' : ''}\n`;
    });
    skillDataJS += '        ];';
    
    const skillDataRegex = /const skillData = \[[\s\S]*?\];/;
    html = html.replace(skillDataRegex, skillDataJS);

    fs.writeFileSync(INDEX_FILE, html);
    console.log('--- TFCalc Sync Completed Successfully ---');
    console.log(`Updated classes: ${classData.map(c => c.name).join(', ')}`);
    console.log(`Updated utility skills: ${skillData.length}`);

} catch (err) {
    console.error('FAILED to sync TFCalc:', err);
}
