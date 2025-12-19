import { defineConfig, globalIgnores } from 'eslint/config';
import pooolint from '@poool/eslint-config';

export default defineConfig(
  globalIgnores([
    'node_modules', 'dist', '.yarn', '.dev', 'build', '.vite', 'out',
    'public', '**/.vite',
  ]),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
      },
    },
  },
  pooolint.configs.recommended,
);
