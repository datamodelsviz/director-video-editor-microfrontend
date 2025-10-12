// Test script for the new workspace naming system
const { generateDefaultWorkspaceName, extractCreativeWord, getWordCategory } = require('./src/utils/workspaceName.ts');

console.log('Testing new workspace naming system...\n');

// Test generating multiple workspace names
console.log('Generated workspace names:');
for (let i = 0; i < 10; i++) {
  const name = generateDefaultWorkspaceName();
  const word = extractCreativeWord(name);
  const category = getWordCategory(word);
  console.log(`${i + 1}. ${name} (word: ${word}, category: ${category})`);
}

console.log('\nTest completed!');
