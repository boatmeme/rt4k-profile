import fs from 'fs/promises';
import path from 'path';
import { RetroTinkProfile } from 'rt4k-profile';

async function findRt4Files(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  let rt4Files = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      rt4Files = rt4Files.concat(await findRt4Files(fullPath));
    } else if (file.isFile() && path.extname(file.name) === '.rt4') {
      rt4Files.push(fullPath);
    }
  }

  return rt4Files;
}

function createOutputPath(inputDir, outputDir, filePath) {
  const relativePath = path.relative(inputDir, filePath);
  const outputFilePath = path.join(outputDir, relativePath);
  const outputDirPath = path.dirname(outputFilePath);
  return outputFilePath;
}

async function main() {
  if (process.argv.length < 6) {
    console.error(
      'Usage: node script.js <input_directory> <output_directory> <template_profile_path> <setting_path1> [<setting_path2> ...]',
    );
    process.exit(1);
  }

  const [, , inputDir, outputDir, templateProfilePath, ...settingPaths] = process.argv;

  try {
    // Load the template profile
    const templateProfile = await RetroTinkProfile.build(templateProfilePath);

    // Find all .rt4 files in the root directory
    const rt4Files = await findRt4Files(inputDir);

    // Process each .rt4 file
    for (const inputFilePath of rt4Files) {
      const profile = await RetroTinkProfile.build(inputFilePath);

      // Merge the specified setting(s) from the template with the current profile
      const updatedProfile = profile.merge(templateProfile.getValues(...settingPaths));

      // Create the same directory structure in the output directory
      const outputFilePath = createOutputPath(inputDir, outputDir, inputFilePath);

      // Save the modified profile to the output directory
      await updatedProfile.save(outputFilePath);
      //console.log(JSON.stringify(updatedProfile.getValues().asPlainObject(), null, 2));
      console.log(`Updated ${outputFilePath}`);
    }

    console.log('All profiles have been updated successfully.');
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

main();
