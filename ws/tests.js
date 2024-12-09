import { opendir } from 'node:fs/promises';

try {
  const dir = await opendir('.\\src', { recursive: true });
  for await (const dirent of dir) {
    if (!dirent.isDirectory()) {
      console.log(dirent.parentPath, dirent.name);
    }
  }
} catch (err) {
  console.error(err);
}
