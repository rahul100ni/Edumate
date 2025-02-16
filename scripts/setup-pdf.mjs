import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Source and destination paths
const nodeModulesDir = join(__dirname, '../node_modules');
const destDir = join(__dirname, '../public');

// Files to copy
const files = [
  {
    source: 'pdfjs-dist/build/pdf.worker.js',
    dest: 'pdf.worker.min.js',
    required: true
  }
];

async function copyFiles() {
  try {
    // Create destination directory if it doesn't exist
    await fs.mkdir(destDir, { recursive: true });

    let success = true;
    
    // Copy files
    for (const file of files) {
      const sourcePath = join(nodeModulesDir, file.source);
      const destPath = join(destDir, file.dest);

      try {
        await fs.access(sourcePath);
        await fs.copyFile(sourcePath, destPath);
        console.log(`✓ Copied ${file.dest} to public directory`);
      } catch (error) {
        if (file.required) {
          console.error(`❌ Error: Required file ${file.source} not found. Error: ${error.message}`);
          success = false;
        } else {
          console.warn(`⚠ Warning: Optional file ${file.source} not found`);
        }
      }
    }

    if (!success) {
      console.error('\nSome required files were not found. Please ensure pdfjs-dist is installed correctly.');
      process.exit(1);
    }

    console.log('\n✨ PDF.js files setup completed successfully!');
  } catch (err) {
    console.error('Error copying files:', err);
    process.exit(1);
  }
}

copyFiles();