## rollup简单配置

// babel核心
@babel/preset-env @babel/core

// rollup核心
rollup

// rollup plugins 
rollup-plugin-babel rollup-plugin-serve

```
rollup -c -w
-c, --config <filename> // Use this config file 
-w, --watch // Watch files in bundle and rebuild on changes
-o, --file <output> // Single output file (if absent, prints to stdout)

```

// 
exclude: "node_modules/**", // glob语法


## 生成代码

1. 模版引擎原理
```
<!-- js沙箱 -->
let render = new Function(`with(this){return ${code}}`);
```