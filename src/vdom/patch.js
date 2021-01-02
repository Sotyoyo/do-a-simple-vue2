export function patch(oldEl, vnode) {
  const parentElm = oldEl.parentNode; // 找到他的父亲
  let elm = createElm(vnode); //根据虚拟节点 创建元素
  parentElm.insertBefore(elm, oldEl.nextSibling);
  parentElm.removeChild(oldEl);
  return elm;
}

function createElm(vnode) {
  let { tag, data, children, text, vm } = vnode;
  if (typeof tag === "string") {
    // 元素
    vnode.el = document.createElement(tag); // 虚拟节点会有一个el属性 对应真实节点
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
