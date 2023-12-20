const fs = require('fs');
const path = require('path');

const productJsonPath = path.join(__dirname, './vscode/product.json');

// Read the JSON file
fs.readFile(productJsonPath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading ${productJsonPath}:`, err);
    return;
  }

  // Parse the JSON data
  let json = JSON.parse(data);

  // Define the new content to be added
  const newContent = {
    extensionsGallery: {
      serviceUrl: 'https://marketplace.visualstudio.com/_apis/public/gallery',
      cacheUrl: 'https://vscode.blob.core.windows.net/gallery/index',
      itemUrl: 'https://marketplace.visualstudio.com/items',
    },
  };

  // Add the new content to the JSON object
  json = { ...json, ...newContent };

  // Write the updated JSON back to the file
  fs.writeFile(productJsonPath, JSON.stringify(json, null, 2), 'utf8', err => {
    if (err) {
      console.error(`Error writing to ${productJsonPath}:`, err);
    } else {
      console.log(`Updated successfully: ${productJsonPath}.`);
    }
  });
});
