import { mergeOptions } from "../utils";

export function initGlobalApi(Vue) {
  Vue.options = {};

  // 1. 添加全局api-混入
  Vue.mixin = function (options) {
    Vue.options = mergeOptions(Vue.options, options);
    return this; // 为了链式调用
  };

  Vue.options._base = Vue; // 无论后续创建多少个子类 都可以通过_base找到Vue
  Vue.options.components = {};
  // 2. 添加全局api-注册组件
  Vue.component = function (id, definition) {
    // definition是一个对象
    // 通过this.options._base找到大Vue，保证具有全局api
    // 保证组件间的隔离，每个组件都会产生一个新的类，去继承父类
    definition = this.options._base.extend(definition);
    this.options.components[id] = definition;
  };
  // 3. 添加全局api-extend
  Vue.extend = function (opts) {
    // 原型继承
    const Super = this; // 父亲大Vue
    const Sub = function VueComponent(options) {
      this._init(options); // 原型继承 没有继承构造函数 所以要写入
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub; // 构造函数指向自己
    Sub.options = mergeOptions(Super.options, opts); // 先把extend接收到的options合并到Sub上去，后面实例化的时候还会再合并
    return Sub;
  };
}
