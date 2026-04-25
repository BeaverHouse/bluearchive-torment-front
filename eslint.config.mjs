import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // React 19의 strict rule들. 기존 코드 다수가 정상 동작하는 패턴
      // (props→local state 동기화, localStorage 초기화 등)을 트리거함.
      // 점진적으로 마이그레이션 예정.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
