import { initMixin } from "./init.js";

function Vue(options) {
  this._init(options); // 初始化操作， 后面还有组件， 组件也需要用到这个方法
}

initMixin(Vue);

export default Vue;
