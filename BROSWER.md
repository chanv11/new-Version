# 浏览器

###  1.从输入 url 到展示的过程

   - DNS 解析
      - DNS解析的过程：

         - 浏览器先查询本地host是否有记录，有则直接返回ip地址给浏览器。没有则进一步查询
         - 向运营商localDNS发起请求，若localDNS的缓存中有记录，则直接返回给用户，若没有则进行迭代查询
         - localDNS首先向根域名服务器发起请求，将查询结果返回IP地址
   - TCP 三次握手
       - 三次握手的过程:

           - 客户端发了个连接请求消息到服务端
           - 服务端接收到消息后的应答，客户端得到服务端的反馈
           - 客户端接收到来自服务器端的确认,明确了从客户端到服务器的数据传输是正常的

   - 发送请求，分析 url，设置请求报文(头，主体)
   - 服务器返回请求的文件 (html)
   - 浏览器渲染

      - HTML parser --> DOM Tree
         - 标记化算法，进行元素状态的标记

            - 将字符数据转化成令牌

               - 每次接收一个或多个输入流中的字符；然后根据当前状态和这些字符来更新下一个状态
               - 比如当接收到“body”字符串时，在标签打开状态会解析成标签，在标签关闭状态则会解析成文本节点
               - 遇到 script 标签时的处理：

                  - 内联代码： 解析过程会暂停，执行权限会转给 JavaScript 脚本引擎，待 JavaScript 脚本执行完成之后再交由渲染引擎继续解析

                     - 脚本内容中调用了改变 DOM 结构的 document.write() 函数，此时渲染引擎会回到第二步，将这些代码加入字符流，重新进行解析。

                  - 外链脚本： 根据标签属性来执行对应的操作
         - dom 树构建

            - 浏览器在创建解析器的同时会创建一个 Document 对象。在树构建阶段，Document 会作为根节点被不断地修改和扩充。标记步骤产生的令牌会被送到树构建器进行处理。HTML 5 标准中定义了每类令牌对应的 DOM 元素，当树构建器接收到某个令牌时就会创建该令牌对应的 DOM 元素并将该元素插入到 DOM 树中。

      - CSS parser --> Style Tree
         - 解析 css 代码，生成样式树

            - CSS 解析的过程与 HTML 解析过程步骤一致，最终也会生成树状结构。
               - 与 DOM 树不同的是，CSSOM 树的节点具有继承特性，也就是会先继承父节点样式作为当前样式，然后再进行补充或覆盖。

      - attachment --> Render Tree
         - 结合 dom树 与 style树，生成渲染树
            - DOM 树包含的结构内容与 CSSOM 树包含的样式规则都是独立的，为了更方便渲染，先需要将它们合并成一棵渲染树。

            - 这个过程会从 DOM 树的根节点开始遍历，然后在 CSSOM 树上找到每个节点对应的样式
      
      - layout: 布局
         - 计算元素的大小及位置
         - 布局完成后会输出对应的“盒模型”，它会精确地捕获每个元素的确切位置和大小，将所有相对值都转换为屏幕上的绝对像素

      - GPU painting: 像素绘制页面
         - 遍历布局树，生成绘制记录，然后渲染引擎会根据绘制记录去绘制相应的内容

### 2.跨标签页通讯

   - `window.open()`和`postMessage`
    
      - ```
        // otherWindow 其他窗口的一个引用，如上述 windowObjectReference
        otherWindow.postMessage(message, targetOrigin, [transfer]);
        // message 将要发送到其他 window的数据
        // targetOrigin 通过窗口的origin属性来指定哪些窗口能接收到消息事件，其值可以是字符串"*"（表示无限制）或者一个URI
        ```

      - ```
        // 父页面
        let windowObjectReference = null
        document.getElementById('btn').onclick = function() {
            if (!windowObjectReference) {
                windowObjectReference = window.open('./other.html', 'Yang')
                windowObjectReference.onload = function() {
                    // windowObjectReference.location.hash = 'Yang'
                    windowObjectReference.postMessage('Yang', windowObjectReference.origin)
                }
            } else {
                // windowObjectReference.location.hash = windowObjectReference.location.hash + 'NB'
                windowObjectReference.postMessage('NB', windowObjectReference.origin)
                windowObjectReference.focus()
            }
        }
        // 子页面
        window.addEventListener("message", function (e) {
            document.title = e.data
            // event.source.postMessage('string', event.origin)
        }
        ```
   - 设置同域下共享的`localStorage`与监听`window.onstorage`

### 3.Event Loop

   - JS分为同步任务和异步任务
   - 同步任务都在主线程上执行，形成一个执行栈
   - 主线程之外，事件触发线程管理着一个任务队列，只要异步任务有了运行结果，就在任务队列之中放置一个事件。
   - 旦执行栈中的所有同步任务执行完毕（此时JS引擎空闲），系统就会读取任务队列，将可运行的异步任务添加到可执行栈中，开始执行。
   - 宏任务

      - 可以理解是每次执行栈执行的代码就是一个宏任务
      - `script`(整体代码)、`setTimeout`、`setInterval`、`I/O`、`UI交互事件`、`postMessage`、`MessageChannel`、`setImmediate`(Node.js 环境)
   
   - 微任务

      - 当前task执行结束后立即执行的任务
      - `Promise.then`、`MutaionObserver`、`process.nextTick`(Node.js 环境)

   - 运行机制

      - 执行一个宏任务
      - 执行过程中如果遇到微任务，就将它添加到微任务的任务队列中
      - 宏任务执行完毕后，立即执行当前微任务队列中的所有微任务
      - 当前宏任务执行完毕，开始检查渲染，然后GUI线程接管渲染
      - 渲染完毕后，JS线程继续接管，开始下一个宏任务（从事件队列中获取）

   - ```
        //请写出输出内容
        async function async1() {
            console.log('async1 start');
            await async2();
            console.log('async1 end');
        }
        async function async2() {
            console.log('async2');
        }

        console.log('script start');

        setTimeout(function() {
            console.log('setTimeout');
        }, 0)

        async1();

        new Promise(function(resolve) {
            console.log('promise1');
            resolve();
        }).then(function() {
            console.log('promise2');
        });
        console.log('script end');


        /*
        script start
        async1 start
        async2
        promise1
        script end
        async1 end
        promise2
        setTimeout
        */
     ```

   - ```
        async function a1 () {
            console.log('a1 start')
            await a2()
            console.log('a1 end')
        }
        async function a2 () {
            console.log('a2')
        }

        console.log('script start')

        setTimeout(() => {
            console.log('setTimeout')
        }, 0)

        Promise.resolve().then(() => {
            console.log('promise1')
        })

        a1()

        let promise2 = new Promise((resolve) => {
            resolve('promise2.then')
            console.log('promise2')
        })

        promise2.then((res) => {
            console.log(res)
            Promise.resolve().then(() => {
                console.log('promise3')
            })
        })
        console.log('script end')

        /*
        script start
        a1 start
        a2
        promise2
        script end
        promise1
        a1 end
        promise2.then
        promise3
        setTimeout
        */
     ```