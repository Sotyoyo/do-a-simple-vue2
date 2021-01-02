import { popTarget, pushTarget, default as Dep } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0;

class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.id = "watcher-" + id++;
    this.exprOrFn = exprOrFn;
    this.user = !!options.user;
    this.cb = cb;
    this.vm = vm;
    this.deps = [];
    this.depsId = new Set();
    this.options = options;

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
      this.getter = () => {
        exprOrFn();
      };
    }

    // new watcher的时候就会调一遍
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
    // console.trace();
    pushTarget(this);
    const value = this.getter();
    popTarget(this);
    return value;
  }

  update() {
    // vue中的更新操作是异步的
    queueWatcher(this); // 多次调用update 我希望先将watcher缓存下来，等一会一起更新
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
}

export default Watcher;
