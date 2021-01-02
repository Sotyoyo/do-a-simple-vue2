import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0;

class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.id = "watcher-" + id++;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.deps = [];
    this.depsId = new Set();
    this.options = options;

    this.getter = exprOrFn;

    this.get();
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
    this.getter();
    popTarget(this);
  }

  update() {
    // vue中的更新操作是异步的
    queueWatcher(this); // 多次调用update 我希望先将watcher缓存下来，等一会一起更新
  }

  run() {
    // 后续要有其他功能
    this.get();
  }
}

export default Watcher;
