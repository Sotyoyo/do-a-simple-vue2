import { parseHtml } from "./compile.js";
import { generate } from "./generate.js";

export function compileToFunctions(html) {
  const ast = parseHtml(html);
  const code = generate(ast);
  const render = new Function(`with(this) {return ${code}}`);
  return render;
}
