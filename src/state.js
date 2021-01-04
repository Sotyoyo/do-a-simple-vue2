import { observe } from "./observer/index.js";
import Watcher from "./observer/watcher.js";
import { proxy } from "./utils.js";

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (key, handler, options = {}) {
    const vm = this;
    options.user = true;

    new Watcher(vm, key, handler, options);
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

function initComputed() {}

function initProps() {
  console.log(this.$options.props);
}

function initWatch() {
  const vm = this;
  let watchs = vm.$options.watch;

  for (let key in watchs) {
    let handler = watchs[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, key, handler) {
  vm.$watch(key, handler);
}
