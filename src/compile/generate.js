import { ELEMENT_TYPE, TEXT_TYPE } from "./compile";
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

// {a: 1, style: {color:red;background:blue}}
function genProps(attrs) {
  // [{name:'xxx',value:'xxx'},{name:'xxx',value:'xxx'}]
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      let styleObj = {};
      attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
        styleObj[arguments[1]] = arguments[2];
      });
      attr.value = styleObj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

function genText(text) {
  if (!defaultTagRE.test(text)) {
    return `_v('${text}')`;
  } else {
    // 'hello' + arr + 'world'    hello {{arr}} {{aa}} world
    let tokens = [];
    let match;
    let lastIndex = (defaultTagRE.lastIndex = 0); // CSS-LOADER 原理一样
    while ((match = defaultTagRE.exec(text))) {
      // 看有没有匹配到
      let index = match.index; // 开始索引
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      tokens.push(`_s(${match[1].trim()})`); // JSON.stringify()
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    return `_v(${tokens.join("+")})`;
  }
}

function getChildren(ele) {
  const props = genProps(ele.attrs);
  const type = ele.type;

  if (type === TEXT_TYPE) {
    return genText(ele.children[0]);
  } else if (type === ELEMENT_TYPE) {
    const children = ele.children
      .map((child) => {
        return getChildren(child);
      })
      .join(",");
    return `_c('${ele.tag}',${props},${children})`;
  }
}

export function generate(ast) {
  const code = getChildren(ast);
  console.log(code);
  return code;
}
