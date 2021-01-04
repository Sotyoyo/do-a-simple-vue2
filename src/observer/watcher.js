import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0;

class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.id = "watcher-" + id++;
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.deps = [];
    this.depsId = new Set();
    this.options = options;
    this.user = !!options.user;

    if (typeof exprOrFn === "string") {
      this.getter = function () {
        let path = exprOrFn.split(".");
        let obj = path.reduce((pre, currentPath) => {
          return pre[currentPath];
        }, vm);
        return obj;
      };
    } else {
      this.getter = exprOrFn;
    }

    this.value = this.get();
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
    pushTarget(this);
    // 记录老的值
    const value = this.getter.call(this.vm);
    popTarget(this);
    // 返回老的值
    return value;
  }

  update() {
    // vue中的更新操作是异步的
    queueWatcher(this); // 多次调用update 我希望先将watcher缓存下来，等一会一起更新
  }

  run() {
    const oldValue = this.value;
    const newValue = this.get();

    if (this.user) {
      this.cb(newValue, oldValue);
      // 别忘了把新的值记录为下次的老值
      this.value = newValue;
    }
  }
}

export default Watcher;
