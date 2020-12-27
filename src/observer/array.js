let oldArrayMethods = Array.prototype;
export let arrayMethods = Object.create(oldArrayMethods);

["push", "pop", "shift", "unshift", "splice", "reverse", "sort"].forEach(
  (method) => {
    arrayMethods[method] = function (...args) {
      const result = oldArrayMethods[method].apply(this, args);
      const ob = this.__ob__; // 因为前面是value: this， 所以可以拿到那个数组的this
      let inserted;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
        case "splice":
          inserted = args.slice(2);
        default:
          break;
      }

      if (inserted) ob.observeArray(inserted);
      return result; // 要返回本来的结果
    };
  }
);
