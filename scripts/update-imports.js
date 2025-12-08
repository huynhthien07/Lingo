const fs = require('fs');
const path = require('path');

function updateImportsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Replace @/backend/controllers/ with @/lib/controllers/
        if (content.includes('@/backend/controllers/')) {
            content = content.replace(/@\/backend\/controllers\//g, '@/lib/controllers/');
            updated = true;
        }
        
        // Replace @/backend/services/ with @/lib/
        if (content.includes('@/backend/services/')) {
            content = content.replace(/@\/backend\/services\//g, '@/lib/');
            updated = true;
        }
        
        // Replace @/shared/types/ with @/lib/types/
        if (content.includes('@/shared/types/')) {
            content = content.replace(/@\/shared\/types\//g, '@/lib/types/');
            updated = true;
        }
        
        // Replace @/shared/constants/ with @/lib/constants/
        if (content.includes('@/shared/constants/')) {
            content = content.replace(/@\/shared\/constants\//g, '@/lib/constants/');
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

function walkDirectory(dir, fileCallback) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
                walkDirectory(filePath, fileCallback);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            fileCallback(filePath);
        }
    });
}

console.log('🔄 Updating import paths...\n');

let updatedCount = 0;
const directories = ['app', 'lib', 'components', 'actions'];

directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`\n📁 Processing ${dir}/...`);
        walkDirectory(dir, (filePath) => {
            if (updateImportsInFile(filePath)) {
                updatedCount++;
            }
        });
    }
});

console.log(`\n✅ Done! Updated ${updatedCount} files.`);

