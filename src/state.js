import Dep from "./observer/dep.js";
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

function initComputed() {
  const vm = this;
  const computed = vm.$options.computed;
  vm._computedWatchers = {};
  for (let key in computed) {
    const userDef = computed[key];
    let getter = typeof userDef === "function" ? userDef : userDef.get;

    // 每一个计算属性实际就是一个watcher
    // 因为计算属性默认是不执行的，所以要给一个lazy true
    vm._computedWatchers[key] = new Watcher(vm, getter, () => {}, {
      lazy: true,
    });
    // 将key定义在vm上，否则是取不到的

    defineComputed(vm, key, userDef);
  }
}

function createComputedGetter(key) {
  return function computedGetter() {
    // 取计算属性的值 走的是这个函数
    // this._computedWatchers 包含着所有的计算属性
    // 通过key 可以拿到对应watcher，这个watcher中包含了getter
    let watcher = this._computedWatchers[key];
    // 脏就是 要调用用户的getter  不脏就是不要调用getter

    if (watcher.dirty) {
      // 根据dirty属性 来判断是否需要重新求值
      watcher.evaluate(); // this.get()
    }

    // 如果当前取完值后 Dep.target还有值  需要继续向上收集
    if (Dep.target) {
      // 计算属性watcher 内部 有两个dep  firstName,lastName
      watcher.depend(); // watcher 里 对应了 多个dep
    }
    return watcher.value;
  };
}

function defineComputed(vm, key, userDef) {
  // 这是为了有的时候有set有的时候没有
  let sharedProperty = {};

  if (typeof userDef === "function") {
    sharedProperty.get = userDef;
  } else {
    sharedProperty.get = createComputedGetter.call(vm, key);
    sharedProperty.set = userDef.set;
  }

  Object.defineProperty(vm, key, sharedProperty);
}

function initProps() {
  console.log(this.$options.props);
}
