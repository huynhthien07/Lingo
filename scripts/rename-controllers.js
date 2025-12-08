const fs = require('fs');
const path = require('path');

// Rename mapping
const RENAMES = {
  // Controllers
  'lib/controllers/courseController.ts': 'lib/controllers/course.controller.ts',
  'lib/controllers/unitController.ts': 'lib/controllers/unit.controller.ts',
  'lib/controllers/lessonController.ts': 'lib/controllers/lesson.controller.ts',
  'lib/controllers/challengeController.ts': 'lib/controllers/challenge.controller.ts',
  'lib/controllers/challengeOptionController.ts': 'lib/controllers/challenge-option.controller.ts',
  'lib/controllers/authController.ts': 'lib/controllers/auth.controller.ts',
  'lib/controllers/adminController.ts': 'lib/controllers/admin.controller.ts',
  'lib/controllers/testController.ts': 'lib/controllers/test.controller.ts',
  
  // Services
  'lib/clerkService.ts': 'lib/services/clerk.service.ts',
  'lib/stripeService.ts': 'lib/services/stripe.service.ts',
  'lib/aiService.ts': 'lib/services/ai.service.ts',
  'lib/databaseService.ts': 'lib/services/database.service.ts',
};

// Import path replacements
const IMPORT_REPLACEMENTS = [
  // Controllers
  { from: '@/lib/controllers/courseController', to: '@/lib/controllers/course.controller' },
  { from: '@/lib/controllers/unitController', to: '@/lib/controllers/unit.controller' },
  { from: '@/lib/controllers/lessonController', to: '@/lib/controllers/lesson.controller' },
  { from: '@/lib/controllers/challengeController', to: '@/lib/controllers/challenge.controller' },
  { from: '@/lib/controllers/challengeOptionController', to: '@/lib/controllers/challenge-option.controller' },
  { from: '@/lib/controllers/userController', to: '@/lib/controllers/user.controller' },
  { from: '@/lib/controllers/adminUserController', to: '@/lib/controllers/user.controller' },
  { from: '@/lib/controllers/authController', to: '@/lib/controllers/auth.controller' },
  { from: '@/lib/controllers/adminController', to: '@/lib/controllers/admin.controller' },
  { from: '@/lib/controllers/testController', to: '@/lib/controllers/test.controller' },
  
  // Services
  { from: '@/lib/clerkService', to: '@/lib/services/clerk.service' },
  { from: '@/lib/stripeService', to: '@/lib/services/stripe.service' },
  { from: '@/lib/aiService', to: '@/lib/services/ai.service' },
  { from: '@/lib/databaseService', to: '@/lib/services/database.service' },
];

console.log('🔄 Step 1: Renaming files...\n');

// Create services directory if not exists
if (!fs.existsSync('lib/services')) {
  fs.mkdirSync('lib/services', { recursive: true });
  console.log('✅ Created lib/services directory');
}

// Rename files
let renamedCount = 0;
for (const [oldPath, newPath] of Object.entries(RENAMES)) {
  if (fs.existsSync(oldPath)) {
    const newDir = path.dirname(newPath);
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }
    fs.renameSync(oldPath, newPath);
    console.log(`✅ Renamed: ${oldPath} → ${newPath}`);
    renamedCount++;
  } else {
    console.log(`⚠️  File not found: ${oldPath}`);
  }
}

console.log(`\n✅ Renamed ${renamedCount} files\n`);

console.log('🔄 Step 2: Updating import paths...\n');

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    for (const { from, to } of IMPORT_REPLACEMENTS) {
      const regex = new RegExp(from.replace(/\//g, '\\/'), 'g');
      if (content.includes(from)) {
        content = content.replace(regex, to);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, fileCallback) {
  if (!fs.existsSync(dir)) return;
  
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

let updatedCount = 0;
const directories = ['app', 'lib', 'components', 'actions'];

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Processing ${dir}/...`);
    walkDirectory(dir, (filePath) => {
      if (updateImportsInFile(filePath)) {
        console.log(`  ✅ Updated: ${filePath}`);
        updatedCount++;
      }
    });
  }
});

console.log(`\n✅ Done! Updated ${updatedCount} files with new import paths.`);

