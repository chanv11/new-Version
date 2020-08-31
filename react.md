# React 
   - Fiber
      - 随着应用变得越来越庞大，整个更新渲染的过程开始变得吃力，大量的组件渲染会导致主进程长时间被占用，导致一些动画或高频操作出现卡顿和掉帧的情况,Fiber为了实现任务分割而诞生的
      - 将原先同步更新渲染的任务分割成一个个独立的 小任务单位，根据不同的优先级，将小任务分散到浏览器的空闲时间执行，充分利用主进程的事件循环机制
      - 调度算法
         - 更新 state 与 props
         - 调用生命周期钩子
         - 生成 virtual dom
         - 通过新旧 vdom 进行 diff 算法，获取 vdom change
         - 确定是否需要重新渲染
      - commit
         - 如需要，则操作 dom 节点更新
      - 任务分割，React 中的渲染更新可以分成两个阶段
         - reconciliation 阶段: vdom 的数据对比，是个适合拆分的阶段，比如对比一部分树后，先暂停执行个动画调用，待完成后再回来继续比对
         - Commit 阶段: 将 change list 更新到 dom 上，并不适合拆分，才能保持数据与 UI 的同步。否则可能由于阻塞 UI 更新，而导致数据更新和 UI 不一致的情况
         - 分散执行: 任务分割后，就可以把小任务单元分散到浏览器的空闲期间去排队执行，而实现的关键是两个新API: requestIdleCallback 与 requestAnimationFrame
         - 低优先级的任务交给requestIdleCallback处理，这是个浏览器提供的事件循环空闲期的回调函数，需要 pollyfill，而且拥有 deadline 参数，限制执行事件，以继续切分任务
         - 高优先级的任务交给requestAnimationFrame处理
         - 链表树遍历算法: 通过 节点保存与映射，便能够随时地进行 停止和重启，这样便能达到实现任务分割的基本前提
         ```
            class Fiber {
                constructor(instance) {
                    this.instance = instance
                    // 指向第一个 child 节点
                    this.child = child
                    // 指向父节点
                    this.return = parent
                    // 指向第一个兄弟节点
                    this.sibling = previous
                }	
            }
         ```

   - 新的生命周期
      - getDerivedStateFromProps(nextProps, preState)
         - 替代componentWillReceiveProps存在的
         - 如果props传入的内容不需要影响到你的state，那么就需要返回一个null

      - getSnapshotBeforeUpdate(prevProps, prevState)
         - 在 React 开启异步渲染模式后，在 render 阶段读取到的 DOM 元素状态并不总是和 commit 阶段相同，这就导致在componentDidUpdate 中使用 componentWillUpdate 中读取到的 DOM 元素状态是不安全的，因为这时的值很有可能已经失效了。
         - 这个新更新代替componentWillUpdate

   - setState
      - 在 合成事件 和 生命周期钩子(除 componentDidUpdate) 中，setState是"异步"的
      - 因为在setState的实现中，有一个判断: 当更新策略正在事务流的执行中时，该组件更新会被推入dirtyComponents队列中等待执行；否则，开始执行batchedUpdates队列更新
      - 解决方法：
         - setState其实是可以传入第二个参数的。setState(updater, callback)，在回调中即可获取最新值
      - 在 原生事件 和 setTimeout 中，setState是同步的，可以马上获取更新后的值
      - 批量更新: 在 合成事件 和 生命周期钩子 中，setState更新队列时，存储的是 合并状态(Object.assign)。因此前面设置的 key 值会被后面所覆盖，最终只会执行一次更新

   - React Hooks
      - 好处
         - 跨组件复用
         - 状态与UI隔离
      - 注意
         - 避免在 循环/条件判断/嵌套函数 中调用 hooks，保证调用顺序的稳定
         - 只有 函数定义组件 和 hooks 可以调用 hooks，避免在 类组件 或者 普通函数 中调用
         - 不能在useEffect中使用useState，React 会报错提示
      - 重要钩子
         - useState: 用于定义组件的 State，其到类定义中this.state的功能
         - useEffect: componentDidMount、componentDidUpdate和componentWillUnmount的结合
            - 两个参数
            - callback: 钩子回调函数
            - source: 设置触发条件，仅当 source 发生改变时才会触发
            - useEffect钩子在没有传入[source]参数时，默认在每次 render 时都会优先调用上次保存的回调中返回的函数，后再重新调用回调

   - React-Redux
      - <Provider>: 将 store 通过 context 传入组件中
      - connect: 一个高阶组件，可以方便在 React 组件中使用 Redux
         - 将store通过mapStateToProps进行筛选后使用props注入组件
         - 根据mapDispatchToProps创建方法，当组件调用时使用dispatch触发对应的action
      - 使用combineReducers()进行重构合并
        