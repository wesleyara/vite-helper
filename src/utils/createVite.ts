import { fileRequest } from "down-git-files";
import fs from "fs";
import { cd } from "shelljs";

import { silentExec } from ".";
import { IDependencies, IProjectDetails } from "../@types";

export const createVite = async ({
  isTypescript,
  projectName,
}: IProjectDetails): Promise<IDependencies> => {
  const folder = isTypescript ? "ts" : "js";
  const extension = folder + "x";
  const viteConfigName = `vite.config.${folder}`;

  silentExec(
    `npm create vite@latest ${projectName} -- --template react${
      isTypescript ? "-ts" : ""
    }`,
  );

  cd(projectName);

  fs.rmSync("src", { recursive: true });
  fs.rmSync(viteConfigName);

  fs.mkdirSync("src");
  fs.mkdirSync("public");
  fs.mkdirSync("src/pages");
  fs.mkdirSync("src/pages/Home");

  await Promise.all([
    fileRequest({
      user: "vite-helper",
      repo: "vite-helper",
      path: "templates/viteTemplate/vercel.json",
      branch: "main",
      file: "vercel.json",
    }),
    fileRequest({
      user: "vite-helper",
      repo: "vite-helper",
      path: `templates/viteTemplate/.gitattributes`,
      branch: "main",
      file: ".gitattributes",
    }),
    fileRequest({
      user: "vite-helper",
      repo: "vite-helper",
      path: `templates/viteTemplate/${folder}/${viteConfigName}`,
      branch: "main",
      file: viteConfigName,
    }),
    fileRequest({
      user: "vite-helper",
      repo: "vite-helper",
      path: "templates/viteTemplate/_redirects",
      branch: "main",
      file: "public/_redirects",
    }),
    fileRequest({
      user: "vite-helper",
      repo: "vite-helper",
      path: `templates/viteTemplate/${folder}/main.${extension}`,
      branch: "main",
      file: `src/main.${extension}`,
    }),
    fileRequest({
      user: "vite-helper",
      repo: "vite-helper",
      path: `templates/viteTemplate/${folder}/index.${extension}`,
      branch: "main",
      file: `src/pages/Home/index.${extension}`,
    }),

    isTypescript
      ? fileRequest({
          user: "vite-helper",
          repo: "vite-helper",
          path: `templates/viteTemplate/${folder}/vite-env.d.ts`,
          branch: "main",
          file: "src/vite-env.d.ts",
        })
      : null,
  ]);

  const typescriptDevDependencies = isTypescript
    ? ["vite-tsconfig-paths", "vite-plugin-checker"]
    : [];

  return {
    dependencies: [],
    devDependencies: [
      "vite-plugin-svgr",
      "@vitejs/plugin-legacy",
      ...typescriptDevDependencies,
    ],
  };
};
