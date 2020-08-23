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

   - 新的生命周期
      - getDerivedStateFromProps(nextProps, preState)
         - 替代componentWillReceiveProps存在的
         - 如果props传入的内容不需要影响到你的state，那么就需要返回一个null

      - getSnapshotBeforeUpdate(prevProps, prevState)
         - 在 React 开启异步渲染模式后，在 render 阶段读取到的 DOM 元素状态并不总是和 commit 阶段相同，这就导致在componentDidUpdate 中使用 componentWillUpdate 中读取到的 DOM 元素状态是不安全的，因为这时的值很有可能已经失效了。
         - 这个新更新代替componentWillUpdate