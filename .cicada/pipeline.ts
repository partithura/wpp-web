import { Job, Pipeline } from "https://deno.land/x/cicada@v0.1.47/mod.ts";

const build = new Job({
  name: "Node Build",
  image: "node",
  steps: [
    {
      name: "Install Dependencies",
      run: "npm install",
      cacheDirectories: ["node_modules"],
    },
    {
      name: "Run build",
      run: "npm run build",
      cacheDirectories: ["node_modules"],
    },
  ],
});

export default new Pipeline(
  [build],
  {
    on: {
      pullRequest: ["main"],
      push: ["main"],
    },
  },
);
