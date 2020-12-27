import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";

export default {
  input: "./src/index.js",
  output: {
    file: "dist/umd/vue.js",
    name: "Vue",
    format: "umd", // 统一模块规范
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: "node_modules/**", // glob语法
    }),
    serve({
      open: false,
      openPage: "/public/index.html",
      port: 3000,
      contentBase: "",
    }),
  ],
};
