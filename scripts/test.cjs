// Uses TypeScript's in-process compiler so tests also work in restricted Windows hosts.
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(
    this,
    request.startsWith("@/")
      ? path.join(process.cwd(), "src", request.slice(2))
      : request,
    ...args,
  );
};
require.extensions[".ts"] = function (module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  });
  module._compile(result.outputText, filename);
};
require("../tests/core.test.ts");
if (process.argv.includes("--fixtures")) {
  const { cubeSTL } = require("../tests/fixtures.ts");
  fs.mkdirSync("tests/fixtures", { recursive: true });
  fs.writeFileSync("tests/fixtures/cube-10mm.stl", Buffer.from(cubeSTL()));
  fs.writeFileSync("tests/fixtures/invalid.stl", "This is not an STL file.");
}
