const fs = require('fs');
const path = require('path');

// Check if dist directory exists
if (!fs.existsSync(path.join(__dirname, '../dist'))) {
    console.error('Error: dist directory does not exist');
    process.exit(1);
}

// Check if index.js exists in dist
if (!fs.existsSync(path.join(__dirname, '../dist/index.js'))) {
    console.error('Error: dist/index.js does not exist');
    process.exit(1);
}

// Check if package.json exists in dist
if (!fs.existsSync(path.join(__dirname, '../dist/package.json'))) {
    console.error('Error: dist/package.json does not exist');
    process.exit(1);
}

console.log('Build verification successful!');
process.exit(0); 