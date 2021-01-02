import { nextTick } from "../utils";

let waiting = false;
const queue = [];
const watchersId = [];

function flushQueue() {
  queue.forEach((item) => item());
}

export function queueWatcher(newWatcher) {
  if (watchersId.findIndex((watcher) => watcher.id === newWatcher.id) > -1) {
    return;
  }
  queue.push(newWatcher.run.bind(newWatcher));

  if (!waiting) {
    nextTick(flushQueue);
    waiting = true;
  }
}
