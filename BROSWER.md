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
   - TCP 四次挥手

      - 客户端进程发出连接释放报文，并且停止发送数据
      - 服务器收到这个FIN报文，它发回一个ACK报文，确认序号为收到的序号加1。和SYN一样，一个FIN报文将占用一个序号
      - 服务器关闭客户端的连接，发送一个FIN给客户端
      - 客户端发回ACK报文确认，并将确认序号设置为收到序号加1。
   - 为什么连接的时候是三次握手，关闭的时候却是四次握手

      - 因为当Server端收到Client端的SYN连接请求报文后，可以直接发送SYN+ACK报文。其中ACK报文是用来应答的，SYN报文是用来同步的。但是关闭连接时，当Server端收到FIN报文时，很可能并不会立即关闭SOCKET，所以只能先回复一个ACK报文，告诉Client端，"你发的FIN报文我收到了"。只有等到我Server端所有的报文都发送完了，我才能发送FIN报文，因此不能一起发送。故需要四步握手

   - 发送请求，分析 url，设置请求报文(头，主体)（考察缓存）
   - 服务器返回请求的文件 (html) （AST）
   - 浏览器渲染(优化)

      - HTML parser --> DOM Tree
         - 标记化算法，进行元素状态的标记

            - 将字符数据转化成令牌

               - 每次接收一个或多个输入流中的字符；然后根据当前状态和这些字符来更新下一个状态
               - 比如当接收到“body”字符串时，在标签打开状态会解析成标签，在标签关闭状态则会解析成文本节点
               - 遇到 script 标签时的处理：

                  - 内联代码： 解析过程会暂停，执行权限会转给 JavaScript 脚本引擎，待 JavaScript 脚本执行完成之后再交由渲染引擎继续解析

                     - 脚本内容中调用了改变 DOM 结构的 document.write() 函数，此时渲染引擎会回到第二步，将这些代码加入字符流，重新进行解析。

                  - 外链脚本： 根据标签属性来执行对应的操作

           - 语法分析 
              - 把开始结束标签配对、属性赋值好、父子关系连接好、构成dom树
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
   - Node
      - node 11 版本中，node 下 Event Loop 已经与浏览器趋于相同
      - 先执行所有类型为 timers 的 MacroTask，然后执行所有的 MicroTask（注意 NextTick 要优先哦）；
        进入 poll 阶段，执行几乎所有 MacroTask(除了 close callbacks 以及 timers 调度的回调和 setImmediate() 调度的回调)，然后执行所有的 MicroTask；
        再执行所有类型为 check 的 MacroTask(setImmediate)，然后执行所有的 MicroTask；
        再执行所有类型为 close callbacks 的 MacroTask，然后执行所有的 MicroTask；
        至此，完成一个 Tick，回到 timers 阶段；




   - 浏览器
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

### 4.重绘和回流

   - 何时发生回流重绘
      
      - 添加或删除可见的DOM元素
      - 元素的位置发生变化
      - 元素的尺寸发生变化（包括外边距、内边框、边框大小、高度和宽度等）
      - 内容发生变化，比如文本变化或图片被另一个不同尺寸的图片所替代。
      - 页面一开始渲染的时候
      - 浏览器的窗口尺寸变化（因为回流是根据视口的大小来计算元素的位置和大小的）
    
   - 减少回流和重绘

      - 修改CSS的class
      - 使用cssText
      - 将动画效果应用到position属性为absolute或fixed的元素上
      - 极限优化时，修改样式可将其display: none后修改
      - 避免多次触发上面提到的那些会触发回流的方法，可以的话尽量用 变量存住

### 5.浏览器缓存

   - 按缓存位置分类

      - 优先级:

         - `Service Worker`
         
            

         - `Memory Cache`

            - 预加载资源，例如`<link rel="preload">`
            - 保证了一个页面中如果有两个相同的请求,都实际只会被请求最多一次，避免浪费
            - 头部配置 `no-store`, 不会存储和读取

         - `Disk Cache`

            - 硬盘上的缓存
            - 会严格根据 HTTP 头信息中的各类字段来判定哪些资源可以缓存

               - 强缓存: 会先访问缓存数据库看缓存是否存在。如果存在则直接返回；不存在则请求真的服务器，响应后再写入缓存数据库。可以造成强制缓存的字段是`Cache-control`和`Expires`

                  - `Expires`: 表示缓存到期时间
                     - `Expires: Thu, 10 Nov 2017 08:45:11 GMT`

                  - `Cache-control`: 使用相对时间
                     - `Cache-control: max-age=2592000`
                        - `max-age`：即最大有效时间
                        - `must-revalidate`: 如果超过了`max-age`的时间，浏览器必须向服务器发送请求，验证资源是否还有效。
                        - `no-cache`: 表示使用协商缓存，即每次使用缓存前必须向服务端确认缓存资源是否更新
                        - `no-store`: 真正意义上的“不要缓存”。所有内容都不走缓存，包括强制和对比
                        - `public`：所有的内容都可以被缓存 (包括客户端和代理服务器， 如 CDN)
                        - `private`：所有的内容只有客户端才可以缓存，代理服务器不能缓存。默认值。
                        - 可以混用`Cache-control:public, max-age=2592000`

                - 协商缓存: 当强制缓存失效(超过规定时间)时，就需要使用对比缓存，由服务器决定缓存内容是否失效。

                   - `Last-Modified & If-Modified-Since`

                      - 服务器通过`Last-Modified`字段告知客户端，资源最后一次被修改的时间

                         - `Last-Modified: Mon, 10 Nov 2018 09:10:11 GMT`

                      - 浏览器将这个值和内容一起记录在缓存数据库中
                      - 下一次请求相同资源时，浏览器从自己的缓存中找出“不确定是否过期的”缓存。因此在请求头中将上次的`Last-Modified`的值写入到请求头的`If-Modified-Since`字段
                      - 服务器会将`If-Modified-Since`的值与`Last-Modified`字段进行对比。如果相等，则表示未修改，响应 304；反之，则表示修改了，响应 200 状态码，并返回数据。
                      - 存在两个问题：

                         - 精度问题，`Last-Modified`的时间精度为秒，如果在 1 秒内发生修改，那么缓存判断可能会失效；
                         - 准度问题，考虑这样一种情况，如果一个文件被修改，然后又被还原，内容并没有发生变化，在这种情况下，浏览器的缓存还可以继续使用，但因为修改时间发生变化，也会重新返回重复的内容。
                   - `ETag`和`If-None-Match`

                      - 浏览器第一次请求资源，服务端在返响应头中加入`Etag`字段，`Etag`字段值为该资源的哈希值

                      - 当浏览器再次跟服务端请求这个资源时，在请求头上加上`If-None-Match`，值为之前响应头部字段 ETag 的值；

                      - 服务端再次收到请求，将请求头`If-None-Match`字段的值和响应资源的哈希值进行比对，如果两个值相同，则说明资源没有变化，返回`304 Not Modified`；否则就正常返回资源内容，无论是否发生变化，都会将计算出的哈希值放入响应头部的`ETag`字段中。
                         
                         - 存在两个问题：

                            - 计算成本。生成哈希值相对于读取文件修改时间而言是一个开销比较大的操作，尤其是对于大文件而言。如果要精确计算则需读取完整的文件内容，如果从性能方面考虑，只读取文件部分内容，又容易判断出错。

                            - 计算误差。HTTP 并没有规定哈希值的计算方法，所以不同服务端可能会采用不同的哈希值计算方式。这样带来的问题是，同一个资源，在两台服务端产生的 Etag 可能是不相同的，所以对于使用服务器集群来处理请求的网站来说，使用 Etag 的缓存命中率会有所降低。

            - 命中缓存之后，浏览器会从硬盘中读取资源

         - 网络请求

            - 如果一个请求在上述3个位置都没有找到缓存，那么浏览器会正式发送网络请求去获取内容
            - 根据`Service Worker`中的`handler`决定是否存入`Cache Storage`(额外的缓存位置)
            - 根据 HTTP 头部的相关字段(`Cache-control`, `Pragma`等)决定是否存入 `disk cache`
            - `memory cache`保存一份资源的引用，以备下次使用

### 6.存储

   - | 特性	| cookie | localStorage | sessionStorage |
     |-|-|-|-|
     |数据生命周期|一般由服务器生成，可以设置过期时间|除非被清理，否则一直存在|页面关闭就清理
     |数据存储大小|4K|5M|5M
     |与服务端通信|每次都会携带在 header 中，对于请求性能影响|不参与|不参与
   
   - 对于`cookie`，我们还需要注意安全性

   - | 属性 | 作用 |
     |-|-|
     |value|如果用于保存用户登录态，应该将该值加密，不能使用明文的用户标识|
     |http-only|不能通过 JS 访问 Cookie，减少 XSS 攻击|
     |secure|只能在协议为 HTTPS 的请求中携带|
     |same-site|规定浏览器不能在跨域请求中携带 Cookie，减少 CSRF 攻击

### 7.常见状态码

   - 1xx: 接受，继续处理
   - 200: 成功，并返回数据
   - 201: 已创建
   - 202: 已接受
   - 203: 成功，但未授权
   - 204: 成功，无内容
   - 205: 成功，重置内容
   - 301: 永久移动，重定向
   - 304: 资源未修改，可使用缓存
   - 305: 需代理访问
   - 400: 请求语法错误
   - 401: 要求身份认证
   - 403: 拒绝请求
   - 404: 资源不存在
   - 500: 服务器错误

### 8.`get`/`post`

   - ||get|post|
     |-|-|-|
     |后退刷新|无害|数据会重新提交
     |书签|可收藏|不可收藏|
     |缓存|能|不能|
     |历史|可保存参数|不可保存参数|
     |对数据长度限制|有限制(2048字符)|无限制|
     |安全性|相对危险，参数暴露再url|相对安全|

### 9.网络安全

   - XSS
      - XSS 通过修改 HTML 节点或者执行 JS 代码来攻击网站
      - 最普遍的做法是转义输入输出的内容，对于引号，尖括号，斜杠进行转义
      - 使用`js-xss`
      - CSP: 规定了浏览器只能够执行特定来源的代码

         - 只允许加载本站资源
            - `Content-Security-Policy: default-src ‘self’`
         - 只允许加载 HTTPS 协议图片
            - `Content-Security-Policy: img-src https://*`

   - CSRF
      - 利用用户的登录态发起恶意请求
         - Token(每次发起请求时将 Token 携带上，服务器验证 Token 是否有效)
         - Get 请求不对数据进行修改
         - 不让第三方网站访问到用户 Cookie
            - 可以对 Cookie 设置 `SameSite` 属性。该属性设置 Cookie 不随着跨域请求发送，该属性可以很大程度减少 CSRF 的攻击，但是该属性目前并不是所有浏览器都兼容

### 10.事件传播
   - 事件传播的三个阶段：捕获，目标对象，冒泡。
      - 其中捕获（Capture）是 事件对象(event object) 从 window 派发到 目标对象父级的过程
      - 目标（Target）阶段是 事件对象派发到目标元素时的阶段，如果事件类型指示其不冒泡，那事件传播将在此阶段终止。
      - 冒泡（Bubbling）阶段 和捕获相反，是以目标对象父级到 window 的过程
         - `stopPropagation`组织冒泡

### CORS
   - Access-Control-Allow-Origin：可接受的域，是一个具体域名或者*，代表任意
   - Access-Control-Allow-Credentials：是否允许携带cookie，默认情况下，cors不会携带cookie，除非这个值是true

### http
   - http1.1
      - 长链接，一个tcp链接可以发送多个请求不必等待前一个结束，但必须按顺序
      - 缓存处理：新增字段cache-control
      - 断点传输
   - http 2.0
      - 多路复用，二进制分帧（解决队头阻塞）
      - header压缩
      - 服务器推送

### https
   - 客户端向服务端443端口发起请求证书，客户端验证这个证书是否由第三方权威机构发布
   - 客户端使用公钥对之后信息交互用的对称加密算法和对称秘钥进行加密，发送给服务端
   - 服务端收到信息后，使用私钥进行解密提取对称加密相关算法和秘钥
   - 后续信息传输使用对称加密

   
      




