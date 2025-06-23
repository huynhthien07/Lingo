import fs from 'fs';
import path from 'path';

const apiRoutes = [
    'app/api/courses/[courseId]/route.ts',
    'app/api/units/[unitId]/route.ts', 
    'app/api/lessons/[lessonId]/route.ts',
    'app/api/users/[userId]/route.ts'
];

const fixApiRoute = (filePath: string) => {
    console.log(`Fixing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`File ${filePath} does not exist, skipping...`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the parameter name from the file path
    const paramMatch = filePath.match(/\[(\w+)\]/);
    if (!paramMatch) {
        console.log(`Could not extract parameter name from ${filePath}`);
        return;
    }
    
    const paramName = paramMatch[1];
    
    // Fix the type definitions
    content = content.replace(
        new RegExp(`{ params }: { params: { ${paramName}: number } }`, 'g'),
        `{ params }: { params: Promise<{ ${paramName}: string }> }`
    );
    
    content = content.replace(
        new RegExp(`{ params }: { params: { ${paramName}: string } }`, 'g'),
        `{ params }: { params: Promise<{ ${paramName}: string }> }`
    );
    
    // Fix the parameter access
    content = content.replace(
        new RegExp(`params\\.${paramName}`, 'g'),
        `(await params).${paramName}`
    );
    
    // For numeric parameters, add parseInt
    if (paramName !== 'userId') { // userId should remain as string
        content = content.replace(
            new RegExp(`\\(await params\\)\\.${paramName}`, 'g'),
            `parseInt((await params).${paramName})`
        );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
};

console.log('Fixing API route parameters...\n');

apiRoutes.forEach(fixApiRoute);

console.log('\n🎉 All API routes fixed!');
