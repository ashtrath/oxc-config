import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "oxc-config",
    projects: [
      {
        test: {
          name: "unit",
          include: ["**/*.test.ts"],
        },
      },
    ],
  },
});
