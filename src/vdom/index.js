import { isObject, isReservedTag } from "../utils";

export function createElement(vm, tag, data = {}, ...children) {
  // 这里要开始区分原始标签还是组件标签了
  if (!isReservedTag(tag)) {
    const Ctor = vm.$options.components[tag]; // 找到此组件名的构造函数，要么找到局部注册的，要么就是全局的
    return createComponent(vm, tag, data, data.key, children, Ctor);
  } else {
    return vnode(vm, tag, data, data.key, children, undefined);
  }
}

function createComponent(vm, tag, data, key, children, Ctor) {
  // 组件的构造函数
  if (isObject(Ctor)) {
    Ctor = vm.$options._base.extend(Ctor); // Vue.extend
  }
  data.hook = {
    // 等会渲染组件时 需要调用此初始化方法
    init(vnode) {
      console.log(`- initing Ctor ${vnode.tag}`, vnode);
      let vm = (vnode.componentInstance = new Ctor({ _isComponent: true })); // new Sub 会用此选项和组件的配置进行合并
      vm.$mount(); // 组件挂载完成后 会在 vnode.componentInstance.$el => <button>
    },
  };
  return vnode(vm, `vue-component-${tag}`, data, key, undefined, undefined, {
    Ctor,
    children,
  });
}

export function createTextElement(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, data, key, children, text, componentOptions) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text,
    componentOptions,
    // .....
  };
}
