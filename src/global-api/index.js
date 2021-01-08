import { mergeOptions } from "../utils";

export function initGlobalApi(Vue) {
  Vue.options = {};

  Vue.mixin = function (options) {
    Vue.options = mergeOptions(Vue.options, options);
    return this; // 为了链式调用
  };
}
