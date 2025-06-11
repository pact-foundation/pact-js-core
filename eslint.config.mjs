// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import importPlugin from 'eslint-plugin-import';
import chaiFriendly from 'eslint-plugin-chai-friendly';
import mochaPlugin from 'eslint-plugin-mocha';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  mochaPlugin.configs.recommended,
  importPlugin.flatConfigs.recommended,
  chaiFriendly.configs.recommendedFlat,
  eslintConfigPrettier
);
