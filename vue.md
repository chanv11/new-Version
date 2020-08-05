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







