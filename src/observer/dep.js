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

Dep.target = null;

export function pushTarget(watcher) {
  Dep.target = watcher;
}
export function popTarget(watcher) {
  Dep.target = null;
}

export default Dep;
