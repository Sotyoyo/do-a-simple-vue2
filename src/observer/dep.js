let id = 0;

class Dep {
  constructor() {
    this.id = "depid-" + id++;
    this.subs = [];
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    this.subs.forEach((watcher) => {
      watcher.update();
    });
  }
}

// 可能有多层
let stack = [];
Dep.target = null;

export function pushTarget(watcher) {
  Dep.target = watcher;
  stack.push(watcher);
}
export function popTarget(watcher) {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}

export default Dep;
