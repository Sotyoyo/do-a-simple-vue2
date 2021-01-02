import { popTarget, pushTarget, default as Dep } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0;

class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.id = "watcher-" + id++;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.vm = vm;
    this.deps = [];
    this.depsId = new Set();
    this.options = options;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.dirty = !!options.lazy;

    if (typeof exprOrFn === "string") {
      this.getter = function () {
        let path = exprOrFn.split(".");
        let obj = vm;
        path.forEach((a) => {
          obj = obj[a];
        });
        return obj;
      };
    } else {
      this.getter = exprOrFn;
    }

    // new watcher的时候就会调一遍 除非是lazy
    this.value = this.lazy ? undefined : this.get();
  }

  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.depsId.add(id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }

  get() {
    // console.trace();
    pushTarget(this);
    // 必须要绑定给vm 否则就是watcher调
    const value = this.getter.call(this.vm);
    popTarget(this);
    return value;
  }

  update() {
    // 在computed watcher中更新值
    if (this.lazy) {
      this.dirty = true;
    } else {
      // vue中的更新操作是异步的
      queueWatcher(this); // 多次调用update 我希望先将watcher缓存下来，等一会一起更新
    }
  }

  run() {
    // 更新的时候走这个方法，会有新的值
    const newValue = this.get();
    const oldValue = this.value;

    // 重写当前值
    this.value = newValue;
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }

  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  // 把计算属性的watcher 依赖的依赖项depend到当前watcher
  depend() {
    this.deps.forEach((dep) => {
      dep.depend();
    });
  }
}

export default Watcher;
