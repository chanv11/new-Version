# Vue

### 1.数据劫持
   - `Proxy`比`defineproperty`优劣如何?

      - `Object.defineProperty`: 无法监听数组变化
      - `Object.defineProperty`:只能劫持对象的属性,因此我们需要对每个对象的每个属性进行遍历，如果属性值也是对象那么需要深度遍历
      - `Proxy`可以直接监听对象而非属性
      - `Proxy`可以直接监听数组的变化
      - `Proxy`直接可以劫持整个对象,并返回一个新对象,不管是操作便利程度还是底层功能上都远强于`Object.defineProperty`

### 2.NextTick 原理分析

   - `Vue.js`源码中分别用 `Promise、setTimeout、setImmediate` 等方式在 `microtask（或是task）`中创建一个事件，目的是在当前调用栈执行完毕以后（不一定立即）才会去执行这个事件

   - `Vue`在修改数据后，视图不会立刻更新，而是等同一事件循环中的所有数据变化完成之后，再统一进行视图更新
   - `microtasks(微任务)`的优先级过高,在某些情况下可能会出现比事件冒泡更快的情况,`macrotasks(宏任务)`又可能会出现渲染的性能问题.会默认使用`microtasks`，但在特殊情况下会使用`macrotasks`。比如 `v-on`. `Vue.js`源码中分别用 `Promise`、`setTimeout`、`setImmediate` 等方式在`microtask（或是macrotasks)`中创建一个事件
   - 对于实现`macrotasks` ，会先判断是否能使用`setImmediate` ，不能的话降级为 `MessageChannel` ，以上都不行的话就使用`setTimeout`
   - 应用场景及原因
      - `created()`操作`dom`需要`NextTick`,因为此时`DOM`未进行任何渲染
      - 在数据变化后要执行的某个操作，而这个操作需要使用随数据改变而改变的DOM结构的时候，这个操作都应该放进`Vue.nextTick()`的回调函数中

### 3.生命周期

   - ```
        new Vue({})
        // 初始化Vue实例
        function _init() {
            // 挂载属性
            initLifeCycle(vm) 
            // 初始化事件系统，钩子函数等
            initEvent(vm) 
            // 编译slot、vnode
            initRender(vm) 
            // 触发钩子
            callHook(vm, 'beforeCreate')
            // 添加inject功能
            initInjection(vm)
            // 完成数据响应性 props/data/watch/computed/methods
            initState(vm)
            // 添加 provide 功能
            initProvide(vm)
            // 触发钩子
            callHook(vm, 'created')
                
            // 挂载节点
            if (vm.$options.el) {
                vm.$mount(vm.$options.el)
            }
        }

        // 挂载节点实现
        function mountComponent(vm) {
            // 获取 render function
            if (!this.options.render) {
                // template to render
                // Vue.compile = compileToFunctions
                let { render } = compileToFunctions() 
                this.options.render = render
            }
            // 触发钩子
            callHook('beforeMounte')
            // 初始化观察者
            // render 渲染 vdom， 
            vdom = vm.render()
            // update: 根据 diff 出的 patchs 挂载成真实的 dom 
            vm._update(vdom)
            // 触发钩子  
            callHook(vm, 'mounted')
        }

        // 更新节点实现
        funtion queueWatcher(watcher) {
            nextTick(flushScheduleQueue)
        }

        // 清空队列
        function flushScheduleQueue() {
            // 遍历队列中所有修改
            for(){
                // beforeUpdate
                watcher.before()
                
                // 依赖局部更新节点
                watcher.update() 
                callHook('updated')
            }
        }

        // 销毁实例实现
        Vue.prototype.$destory = function() {
            // 触发钩子
            callHook(vm, 'beforeDestory')
            // 自身及子节点
            remove() 
            // 删除依赖
            watcher.teardown() 
            // 删除监听
            vm.$off() 
            // 触发钩子
            callHook(vm, 'destoryed')
        }
     ```

### 4.virtual dom

   - VD只是一个简单的JS对象，并且最少包含`tag`、`props`和`children`三个属性
      - ```
        {
            tag: "div",
            props: {},
            children: [
                "Hello World", 
                {
                    tag: "ul",
                    props: {},
                    children: [{
                        tag: "li",
                        props: {
                            id: 1,
                            class: "li-1"
                        },
                        children: ["第", 1]
                    }]
                }
            ]
        }
        ```
   - VD 最大的特点是将页面的状态抽象为`JS`对象的形式，配合不同的渲染工具，使跨平台渲染成为可能。
   - 在进行页面更新的时候，借助VD，`DOM`元素的改变可以在内存中进行比较，再结合框架的事务机制将多次比较的结果合并后一次性更新到页面，从而有效地减少页面渲染的次数，提高渲染效率
   - 一般的设计思路都是页面等于页面状态的映射，即`UI = render(state)`。当需要更新页面的时候，无需关心`DOM`具体的变换方式，只需要改变`state`即可
      - `state`变化，生成新的VD
      - 比较`VD`与之前`VD`的异同
      - 生成差异对象`（patch）`
      - 遍历差异对象并更新`DOM`

   - 差异对象与每一个`VDOM`元素一一对应
      - `type`对应的是`DOM`元素的变化类型，有 4 种：新建、删除、替换和更新。props 变化的`type`只有2种：更新和删除
      - ```
        {
            type,
            vdom,
            props: [{
                    type,
                    key,
                    value 
                    }]
            children
        }
        ```
       - ```
            const nodePatchTypes = {
                CREATE: 'create node',
                REMOVE: 'remove node',
                REPLACE: 'replace node',
                UPDATE: 'update node'
            }

            const propPatchTypes = {
                REMOVE: 'remove prop',
                UPDATE: 'update prop'
            }
         ```
   - 创建 dom 树
   - 树的`diff`，同层对比，输出`patchs(listDiff/diffChildren/diffProps)`

      - 没有新的节点，返回

      - 对比属性(对比新旧属性列表):
         - 旧属性是否存在与新属性列表中
         - 都存在的是否有变化
         - 是否出现旧列表中没有的新属性

      - tagName和key值变化了，则直接替换成新节点

      - 渲染差异
         - 遍历`patchs`， 把需要更改的节点取出来
         - 局部更新`dom`

### 5.vux

   - Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式
      - state: 状态仓库
      - getter: 可以认为是 store 的计算属性,getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算，可通过方法访问
         - ```
            getters: {
                // ...
                getTodoById: (state) => (id) => {
                    return state.todos.find(todo => todo.id === id)
                }
            }
           ```
         - mapGetters
            - ```
                computed: {
                    // 使用对象展开运算符将 getter 混入 computed 对象中
                    ...mapGetters([
                    'doneTodosCount',
                    'anotherGetter',
                    // ...
                    ])
                }
              ```
       - Mutation
          - 更改 Vuex 的 store 中的状态的唯一方法，接受 state 作为第一个参数
          - 调用`store.commit`方法，唤醒一个 mutation
          - Mutation 必须是同步函数
       - Action
          - Action 提交的是 mutation，而不是直接变更状态
          - Action 可以包含任意异步操作
          - Action 通过`store.dispatch `触发
      - Module
         - 由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿,Vuex 允许我们将 store 分割成模块（module）。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割
         - `namespaced: true` 使其成为带命名空间的模块
         - 带命名空间的模块内访问全局内容
            - 如果你希望使用全局 state 和 getter，rootState 和 rootGetters 会作为第三和第四参数传入 getter，也会通过 context 对象的属性传入 action。
            - 若需要在全局命名空间内分发 action 或提交 mutation，将 { root: true } 作为第三参数传给 dispatch 或 commit 即可

### 6.插件
   - 插件通常用来为 Vue 添加全局功能
   - 通过全局方法 `Vue.use()` 使用插件。它需要在你调用 `new Vue()` 启动应用之前完成
   - Vue.js 的插件应该暴露一个`install`方法。这个方法的第一个参数是`Vue `构造器，第二个参数是一个可选的选项对象

### 7.注册或获取全局指令
   - ```
        // 注册一个全局自定义指令 `v-focus`
        Vue.directive('focus', {
        // 当被绑定的元素插入到 DOM 中时……
        inserted: function (el) {
            // 聚焦元素
            el.focus()
        }
        })
     ```

### 8.keep-alive
   - 可以使被包含的组件保留状态，或避免重新渲染
   - include - 字符串或正则表达式，只有名称匹配的组件会被缓存
   - exclude - 字符串或正则表达式，任何名称匹配的组件都不会被缓存
   - include 和 exclude 的属性允许组件有条件地缓存。二者都可以用“，”分隔字符串、正则表达式、数组。当使用正则或者是数组时，要记得使用v-bind

### 9.vue常用的修饰符
   - prevent: 提交事件不再重载页面；.stop: 阻止单击事件冒泡；.self: 当事件发生在该元素本身而不是子元素的时候会触发；.capture: 事件侦听，事件发生的时候会调用

### 10.Vue 中的 computed 和 watch 的区别
   - watch擅长处理的场景：一个数据影响多个数据，实质就是将变量的get属性重写成了你所定义的那个函数，也就是说实现了数据劫持那一步
   - computed擅长处理的场景：一个数据受多个数据影响，观察者模式将变量丢进了观察者收集器当中，变化可以被通知到

### 11.data为何是一个函数而不是对象
   - 每复用一个组件都会return一个新的data，相当于组件的私有数据空间

   - 调用 data() 函数，并将其 this 指向当前组件实例 vm，同时将当前实例作为参数传递给 data() 函数，然后将返回的数据对象存储到组件实例 vm._data 属性中







