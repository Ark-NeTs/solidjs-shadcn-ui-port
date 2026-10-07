// Check handwritten TypeScript without pulling application lint rules into the library; D19.
import tseslint from 'typescript-eslint';
export default tseslint.config(...tseslint.configs.recommended, { ignores: ['dist/**', 'validation/**', 'coverage/**'] });
