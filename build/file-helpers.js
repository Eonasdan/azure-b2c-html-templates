import {cp as cpSync, promises as fs} from 'fs';
import path from 'path';
import { promisify } from 'util';

const cp = promisify(cpSync);

export class FileHelpers {

  /**
   * Converts a '/path/to/` to use path join instead for cross compat
   * @param input
   * @return {string}
   */
  static stringToPath(input) {
    return path.join(...input.split('/'));
  }

  static async removeDirectoryAsync(directory, removeSelf = true, filter) {
    try {
      let files = (await fs.readdir(directory)) || [];
      if (filter) files = files.filter(filter);
      for (const file of files) {
        const filePath = path.join(directory, file);
        if ((await fs.stat(filePath)).isFile())
          await FileHelpers.removeFileAsync(filePath);
        else await FileHelpers.removeDirectoryAsync(filePath, true, filter);
      }
    } catch (e) {
      return;
    }
    if (removeSelf) await fs.rmdir(directory);
  }

  static async removeFileAsync(filePath) {
    if (!(await fs.stat(filePath)).isFile()) return;
    try {
      await fs.unlink(filePath);
    } catch (e) {}
  }

  static async copyFileAsync(filePath, destination, isDirectory = false) {
    //copy all
    if (!filePath) {
      await cp(
          this.stringToPath(`./templates/Bootstrap/assets`),
          this.stringToPath('./emulator/assets'),
          { recursive: true }
      );
      return;
    }
    if (isDirectory) {
      await cp(
          this.stringToPath(filePath),
          this.stringToPath(destination),
          { recursive: true }
      );
      return;
    }
    await fs.copyFile(filePath, destination);
  }

  static async writeFileAndEnsurePathExistsAsync(filePath, content) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    await fs.writeFile(filePath, content);
  }

  static async fileExists(file) {
    try {
      return !!(await fs.stat(file));
    } catch (err) {
      return false;
    }
  }
}
