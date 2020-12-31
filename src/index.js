import { initMixin } from "./init.js";
import { lifecycleMixin } from "./lifecycle.js";
import { renderMixin } from "./render.js";

function Vue(options) {
  this._init(options); // 初始化操作， 后面还有组件， 组件也需要用到这个方法
}

initMixin(Vue);
renderMixin(Vue);
lifecycleMixin(Vue);

export default Vue;
