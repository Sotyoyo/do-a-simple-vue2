const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

let root = null;
let stack = [];
const ELEMENT_TYPE = 1;
const TEXT_TYPE = 3;

function createAstElemnt(tagName, attrs, type = ELEMENT_TYPE) {
  return {
    tag: tagName,
    type,
    attrs,
    parent: null,
    children: [],
  };
}

function whenGetStartTag(tagName, attrs) {
  console.log("- start", tagName, attrs);
  let element = createAstElemnt(tagName, attrs, ELEMENT_TYPE);
  if (!root) root = element; // 如果这个标签是第一个，那么就应该设置成根结点

  // 获取元素的父节点
  let parent = stack[stack.length - 1];
  if (parent) element.parent = parent;

  stack.push(element);
}

function whenGetEndTag(tagName) {
  console.log("- end", tagName);
  let last = stack.pop();
  if (last.tag !== tagName) {
    throw Error("标签不匹配");
  }
}

function whenGetChars(text) {
  text = text.replace(/\s*/g, "");
  console.log(`'${text}'`);
  if (!text) return;

  // 如果有内容的话
  // 1. 塞入父亲的儿子节点
  // 2. 记录父亲节点
  // 3. 不入栈
  let element = createAstElemnt("text", [], TEXT_TYPE);
  let parent = stack[stack.length - 1];
  if (parent) {
    parent.children.push(element);
    element.parent = parent;
  }
}

function parseHTML(html) {
  // <div id="app">123</div>
  // 只要有内容 就一直解析，并且把解析过的内容删除
  while (html) {
    // < 不是开始标签就是结束标签
    let textEnd = html.indexOf("<");
    if (textEnd == 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        whenGetStartTag(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        whenGetEndTag(endTagMatch[1]);
        continue;
      }
    }
    let text;
    if (textEnd >= 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      advance(text.length);
      whenGetChars(text);
    }
  }
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({ name: attr[1], value: attr[3] });
      }
      if (end) {
        advance(end[0].length);
        return match;
      }
    }
  }
}
export function compileToFunctions(template) {
  parseHTML(template);
  console.log(root);
  return function () {};
}
