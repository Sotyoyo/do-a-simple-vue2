import { observe } from "./observer/index.js";
import { proxy } from "./utils.js";

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

function initWatch() {}
