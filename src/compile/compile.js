const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >

export const ELEMENT_TYPE = 1;
export const TEXT_TYPE = 3;

function createAstElemnt(tagName, attrs, type = ELEMENT_TYPE) {
  return {
    tag: tagName,
    type,
    attrs,
    parent: null,
    children: [],
  };
}

export function parseHtml(html) {
  // 1. 词法解析
  // 2. 转成ast树
  // 3. 代码生成
  let root = null;
  let stack = [];
  function start(tagName, attrs) {
    // console.log(" meet startTag: ", tagName, attrs);
    let element = createAstElemnt(tagName, attrs, ELEMENT_TYPE);
    if (!root) {
      // 如果不存在根节点
      root = element;
    }
    stack.push(element);
  }

  function chars(text) {
    if (!text.trim()) {
      text = text.trim();
    } else {
      text = text.replace(/\s+/g, " ");
    }

    // text && console.log(" meet chars:    ", text);
    if (text) {
      let textElement = createAstElemnt("text", [], TEXT_TYPE);
      let lastNode = stack[stack.length - 1];
      textElement.parent = lastNode.tagName;
      textElement.children.push(text);
      lastNode.children.push(textElement);
    }
  }

  function end(tagName) {
    // console.log(" meet endTag:   ", tagName);
    // 匹配成功，出栈
    let lastNode = stack.pop();
    if (!lastNode || tagName !== lastNode.tag) {
      throw Error("标签不能匹配！");
    }

    if (!stack[stack.length - 1]) {
      // 到达栈底部
    } else {
      lastNode.parent = stack[stack.length - 1].tagName;
      stack[stack.length - 1].children.push(lastNode);
    }
  }

  function advance(step) {
    html = html.substring(step);
  }

  function parseStartTag() {
    let startMatched = html.match(startTagOpen);
    // 如果能匹配开始标签的开始
    if (startMatched) {
      // 匹配标签名
      const matched = {
        tagName: startMatched[1],
        attrs: [],
      };
      advance(startMatched[0].length);

      // 匹配属性对
      let end, attr;
      // 要判断是否是html结尾。。。
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        matched.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
        advance(attr[0].length);
      }

      if (end) {
        advance(end[0].length);
      }

      return matched;
    }
  }

  while (html) {
    // 一个周期
    const startIndex = html.indexOf("<");

    if (startIndex === 0) {
      const startMatched = parseStartTag(html); // 解析开始标签
      if (startMatched) {
        start(startMatched.tagName, startMatched.attrs);
        // 这里是精髓 需要直接走下次了，相当于每一次只触发一个hook
        continue;
      }

      let endMatched = html.match(endTag);
      // 如果能匹配开始标签的结束
      if (endMatched) {
        end(endMatched[1]);
        advance(endMatched[0].length);
        // 这里是精髓 需要直接走下次了，相当于每一次只触发一个hook
        continue;
      }
    } else if (startIndex > 0) {
      // 接下是匹配content
      let content;
      if (startIndex > 0) {
        // 取出前面的内容
        content = html.substring(0, startIndex);
      }
      if (content) {
        chars(content);
        advance(content.length);
      }
      // 其实这里加不加无所谓 因为已经走到程序的尽头了
      continue;
    } else {
      throw Error("不是一个正经的模版!");
    }
  }

  return root;
}
