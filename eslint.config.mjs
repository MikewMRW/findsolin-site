// Minimal flat ESLint config so Next.js is satisfied during build
export default [
  {
    ignores: ["node_modules", ".next", "dist"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    rules: {}
  }
];
