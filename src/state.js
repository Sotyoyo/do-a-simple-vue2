import { observe } from "./observer/index.js";
import Watcher from "./observer/watcher.js";
import { proxy } from "./utils.js";

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (key, handler, options = {}) {
    options.user = true; // 是一个用户自己写的watcher

    // vm,name,用户回调，options.user
    new Watcher(this, key, handler, options);
  };
}

export function initState(vm) {
  const opts = vm.$options;

  if (opts.props) {
    initProps.call(vm);
  }

  if (opts.data) {
    initData.call(vm);
  }

  if (opts.computed) {
    initComputed.call(vm);
  }

  if (opts.watch) {
    initWatch.call(vm);
  }
}

function initData() {
  const vm = this;
  let data = vm.$options.data;
  data = vm._data = typeof data === "function" ? data.call(vm) : data;

  // 代理到vm上
  for (let key in data) {
    proxy(vm, "_data", key);
  }

  observe(data);
}

function initWatch() {
  const vm = this;
  const watch = vm.$options.watch;

  Object.keys(watch).forEach((key) => {
    let handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  });
}

function createWatcher(vm, key, handler) {
  vm.$watch(key, handler);
}

function initComputed() {}

function initProps() {
  console.log(this.$options.props);
}
