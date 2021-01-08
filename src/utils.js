export function isObject(o) {
  return typeof o === "object" && o !== null;
}

export function isFunction(o) {
  return o && typeof o === "function";
}

export function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}

const callbacks = [];
function flushCallbacks() {
  callbacks.forEach((cb) => cb());
  waiting = false;
}
let waiting = false;
function timer(flushCallbacks) {
  let timerFn = () => {};
  if (Promise) {
    timerFn = () => {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    let textNode = document.createTextNode(1);
    let observe = new MutationObserver(flushCallbacks);
    observe.observe(textNode, {
      characterData: true,
    });
    timerFn = () => {
      textNode.textContent = 3;
    };
    // 微任务
  } else if (setImmediate) {
    timerFn = () => {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFn = () => {
      setTimeout(flushCallbacks);
    };
  }
  timerFn();
}

// 微任务是在页面渲染前执行 我取的是内存中的dom，不关心你渲染完毕没有

export function nextTick(cb) {
  callbacks.push(cb); // flushSchedulerQueue / userCallback

  if (!waiting) {
    timer(flushCallbacks); // vue2 中考虑了兼容性问题 vue3 里面不在考虑兼容性问题
    waiting = true;
  }
}

const lifeCycleHooks = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];
const strats = {};
lifeCycleHooks.forEach((hookName) => {
  strats[hookName] = mergeHook;
});

function mergeHook(parent, child) {
  if (!parent && isFunction(child)) {
    return [child];
  } else if (Array.isArray(parent) && isFunction(child)) {
    return [...parent, child];
  }
}

export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }

  function mergeField(key) {
    const parentVal = parent[key];
    const childVal = child[key];

    if (strats[key]) {
      isFunction(strats[key]) &&
        (options[key] = strats[key](parentVal, childVal));
    } else {
      // 非策略的话
      if (!isObject(parentVal) && !isObject(childVal)) {
        // 都不是对象的话
        options[key] = childVal || parentVal;
      } else {
        options[key] = { ...parentVal, ...childVal };
      }
    }
  }
  // console.log(parent, child, options);
  return options;
}
