import { initState } from "./state.js";
import { compileToFunctions } from "./compile.js";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;

    // 初始化状态
    initState(vm);
    // 页面挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);

    if (!options.render) {
      // 如果有template有限走template
      let template = options.template;
      if (template) {
      } else if (!template && el) {
        template = el.outerHTML;
      } else if (!template && !el) {
        throw Error("没有可编译的模版！");
      }
      // vm.$options.render = compileToFunctions(template);
      console.log(compileToFunctions(template));
    }

    // updateComponent()
  };
}
