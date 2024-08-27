import { glob } from 'glob';
import path from 'node:path';

async function test(patterns: string[]) {
  if (patterns.length < 1) {
    patterns = ['**/*.spec.js', '**/*.spec.ts', '**/*.test.js', '**/*.test.ts'];
  }

  const files = await glob(
    patterns.map((pattern) => path.resolve(__dirname, pattern)),
  );
  await Promise.all(files.map((file) => import(file)));
}
void test(process.argv.slice(2));
