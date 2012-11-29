!function(win, doc){
  // TODO:
  // =====
  // 1. 11.14 把parse跑通
  // 2. 11.16 把find 简单跑起来
  // 3. 11.18 把程序跑通
  // 4. 11.19 性能优化
  // 5. 11.20-11.27 PPT准备 
  

  //         1.命名空间
  // ===========================
  
  // 同时也是all的便利接口
  var nes =function(sl,node){return nes.all(sl,node)}

  nes.version = "0.0.3"
  // TODO: 内容
  // 1. 重构 √
  // 2. 自定义ruler 并setup  √
  // 3. nthChild方法的重构 直接从childNodes中进行判断而不是同级游走 (需测试)
  // 4. 准备{a,b}(类似regexp的例子)
  // 5. 准备好pesudo(incude?) attr combo的例子
  // 6. try cache 捕获未被系统识别的selector
  // 7. 准备好delegate Event的例子

  var 
    // var cache
    ap = Array.prototype,
    op = Object.prototype,
    sp = String.prototype,
    fp = Function.prototype,
    slice = ap.slice,

    body = doc.body,
    hasQuerySelector = doc.querySelector,
    $ = function(sl,node){return (node||doc).querySelector(sl)},
    $$ = function(sl,node){return (node||doc).querySelectorAll(sl)},
    
    // Helper
    // -------------------------

    // 最短的比typeof 更可信的类型判断 
    typeOf = function(o){
      return o == null? String(o) : 
        op.toString.call(o).slice(8, -1).toLowerCase()
    },
    // 简单对象扩展
    extend = function(o1, o2, override){
      for(var i in o2){
        if(o1[i] == null || override) o1[i] = o2[i]
      }
    },
    toArray = function(arr){
      return slice.call(arr)
    },
    createCache = function(max){
      var keys = [],
        cache = {}
        return {
          set:function(key , value){
            if(keys.length > max){
              delete cache[keys.shift()]
            }
            cache[key] = value
            keys.push(key)
            return value
          },
          get:function(key){
            return cache[key]
          }
        }
    }
  // Fixed: toArray 低于IE8的 Nodelist无法使用slice获得array
  try{
    slice.call(doc.getElementsByTagName("body"))
  }catch(e){
    toArray = function(arr){
      var result = [],len=arr.length
      for(var i =0;i<len;i++){
        result.push(arr[i])
      }
      return result
    }
  }
    // 扩展 native 方法
    // ----------------------

    //es5 trim
  var trimReg = /^\s+|\s+$/g
  sp.trim = sp.trim || function(){
    return this.replace(trimReg, "")
  }
  //es5 bind
  fp.bind = fp.bind || function(context, args) {
    args = slice.call(arguments, 1);
    var fn = this;
    return function() {
        fn.apply(context, args.concat(slice.call(arguments)));
    }
  }
  //es5 Array indexOf
  ap.indexOf = ap.indexOf || function(a) {
    for (var i = 0, len = this.length; i < len; i++) {
      if (a === this[i]) return i
    }
    return -1
  } 

  //       2. Parse 
  // =====================

  // local var cache
  var 
    replaceReg = /\{([^\}]*)\}/g, //替换rule中的macro
    esReg = /[-[\]{}()*+?.\\^$|,#\s]/g, //需转移字符
    nthReg = /^nth-[\w-]+$/,
    nthValueReg = /^(?:(\d+)|([+-]?\d*)?n([+-]\d+)?)$/,// nth伪类的value规则

    TRUNK = null, //
    // 获取token
    uid =(function(token){
      var _uid = 0 
      return function(){return token + (_uid++) }
    })("nes_"+(+new Date).toString(36)),
    // 提取nthValue中的有用信息
    nthCache = createCache(100),
    extractNthValue = function(param){
     var step,start,res
      //如果无参数 当成是获取第一个元素
      if(!param || !(param = param.replace(/\s+/g,""))){
        return {start:1, step:0 }
      }
      if(res = nthCache.get(param)) return res
      if(param == "even"){
        start = 2
        step = 2
      }else if(param == "odd"){
        step = 2
        start = 1
      }else{
        res = param.match(nthValueReg)
        if(!res) throw Error("错误的nth-child格式"+param)
        if(res[1]){
          step = 0
          start = parseInt(res[1])
        }else{
          step = res[2]? parseInt(res[2]) :1
          start = res[3]? parseInt(res[3]):0
        }
      }
      if(start<1){
        if(step <1) throw Error("an+b中的a，b不能同时都小于1")
        start = -(-start)%step +step
      } 
      return nthCache.set(param,{start:start,step:step})
    }


  // parse 逻辑相关
  var 
    //将 # . [] : ()列为保留字
    macros = {
      split:"\\s*,\\s*", // 分隔符
      operator: "[^\\w#.\\[\\]:\\(\\)]?=", // 属性操作符 如= 、!=
      combo: "[^\\w#.\\[\\]:\\(\\)](?!=)", // 连接符 如 > ~ 
      // 中文unicode范围http://baike.baidu.com/view/40801.htm#sub40801_3
      word: "[\\w\\u4e00-\\u9fbf-]" 
    },
    rules = {
      split:{
        reg:"{split}",
        action:function(all){
          var data = this.data
          data.push([null])
        }
      },
      combo:{
        reg:"{combo}",
        action:function(all){
          var data = this.data
            cur = data[data.length-1]
          this.current().combo = all
          cur.push(null)
        }
      },
      id:{
        reg:"#({word}+)",
        action:function(all, id, next){
          this.current().id = id
        }
      },
      tag:{
        reg:"\\*|{word}+",// 单纯的添加到
        action:function(all){
          this.current().tag = all.toLowerCase()
        }
      },
      classList:{
        reg:"\\.({word}+)",
        action:function(all,className){
          var current = this.current(),
            classList = current.classList || (current.classList = [])
          classList.push(className)
        }
      },
      pesudos:{
        reg:":({word}+)(?:\\(([^\\(\\)]*)\\))?",
        action:function(all,name, param){
          var current = this.current(),
          pesudos = current.pesudos || (current.pesudos = [])
          if(nthReg.test(name)){
            // parse 的成本是很小的 尽量在find前把信息准备好
            // 这里我们会把nth-child(an+b) 的 a 与 b 在不同输入下标准化
            param = extractNthValue(param) 
          }
          pesudos.push({name:name,param:param})
        }
      },
      attributes:{
        reg:"\\[({word}+)(?:({operator})[\'\"]?((?:{word}||\\s)+)[\'\"]?)?\\]",
        action:function(all,key,operator,value, next){
          var current = this.current(),
          attributes = current.attributes || (current.attributes = [])
          attributes.push({key:key,operator:operator,value:value})
        }
      },
      pesudoElements:{
        reg:"::({word}+)",
        action:function(all, next){

        }
      }
    },
    links={} // symbol link 当setup之后会产生一个map来实现exec之后的参数对应

  //分析出regexp中的子匹配数
  var ignoredReg = /\(\?\!|\(\?\:/
  var extractReg = function(regStr){
    var left = right = 0,len = regStr.length
      ignored = regStr.split(/\(\?\!|\(\?\:/).length-1//忽略非捕获匹配

    for(;len--;){
      var letter = regStr.charAt(len)
      if(len==0 || regStr.charAt(len-1)!=="\\"){ //不包括转义括号
        if(letter === "(") left++
        if(letter === ")") right++
      }
    }
    if(left !== right) throw regStr+"中的括号不匹配"
    else return left - ignored
  }

  //这里替换掉Rule中的macro
  var cleanRule = function(rule){
    rule.reg = rule.reg.replace(replaceReg, function(a ,b){
      if(b in macros) return macros[b]
      else throw new Error('can"t replace undefined macros:' +b)
    })
  }
  var cleanRules = function(rules){
    for(var i in rules){
      if(rules.hasOwnProperty(i)) cleanRule(rules[i])
    }
  }

  // API: 1. addRule         
  // ----------------
  // 自定义规则, 增加全新语法
  // __options:__
  // 1. name{string} __可忽略__ 随机生成(为了可读性尽量带上)
  // 2. rule 规则对象它包括
  //    * reg{string|regexp}:    规则的标准RegExp表达 __不可忽略__
  //    * action: parse时的动作 参数与__reg__相关(exec后的匹配) __可忽略__
  //    * filter: find时的过滤操作 参数与__action__有关 __可忽略__
  // 
  // 具体例子可以参考上方的rules对象,需要说明的是action回调中的this对象指向parsed
  // data对象,而filter中的node参数为当前遍历到的node
  
  var addRule = nes.addRule = function(name, rule){
    if(!rule){
      rule = name
      name = uid()
    } 
    if(typeOf(name) === "object"){
      for(var i in name){
        addRule(i,name[i])
      }
    }else{
      if(rules[name]) throw Error("addRule失败:已有相同规则名存在:"+name)
      rules[name] = cleanRule(rule)
    }
    setup() //每次添加新规则后都重新组装一边
    return name //返回name
  }
  // 组装
  // ------
  // 组装处理三件事:
  // 1. 生成symbol link 生成exec结果与action参数的对应
  // 2. 替换{}占位符，并生成Big Trunk
  // 3. 生成默认 action
  var setup = function(){
    var curIndex = 1, //当前下标
      retain = 0,
      splits = [],
      regexp,
      filter,
      action

    for(var i in rules){
      if(rules.hasOwnProperty(i)){
        regexp = rules[i].reg
        filter = rules[i].filter
        retain = extractReg(regexp)+1 // 需要保留的参数
        links[curIndex] = [i,retain] //分别是rule名，参数数量
        curIndex += retain
        splits.push(regexp)
        if(filter && !filters[i]){
          filters[i] = rules[i].filter //将filter转移到filters下
        }
      }
    }
    TRUNK = new RegExp("("+splits.join(")|(")+")","g")
    // 
    // 
  }

  
  //    parse主逻辑
  // ----------------
  var 
    cleanReg = cleanReg = new RegExp("\\s*(,|" + macros.combo + "|" + macros.operator + ")\\s*","g"),
    clean = function(sl){
      return sl.trim().replace(/\s+/g," ").replace(cleanReg,"$1")
    },
    // Process:处理每次匹配的函数
    // --------------------------
    // 1. 根据symbol link 散布参数
    process = function(){
      var parsed = this,
        args = slice.call(arguments),
        ruleName, link, rule, index

        for(var i in links){
          link = links[i]
          ruleName = link[0]
          retain =link[1]
          index = parseInt(i) 
          if(args[i] && (rule = rules[ruleName])){
            rule.action.apply(this,args.slice(index,index+retain))
          }
        }
    },
    parseCache = createCache(200)

  var parse = nes.parse =  function(sl){
    
    var selector = clean(sl),parsed
    if(parsed = parseCache.get(selector)) return parsed

    var parsed = {},
      data = parsed.data = [[null]],
      part

    parsed.error = function(msg){
      throw Error("选择符\"" + selector + "\"在(pos:" +
        (parsed.index + parsed.lastMatch.length) + "):" + (msg||"Parse Error"))
    }
    parsed.current = function(){
      var piece = data[data.length-1],
        len = piece.length
      return piece[len-1] || (piece[len-1] = {tag:"*"})
    }
    while(part = TRUNK.exec(selector)){
      if(parsed.lastMatch&&parsed.lastMatch.length+parsed.index !== part.index) parsed.error("Syntax Error——有未识别语法")
      parsed.index = part.index
      parsed.lastMatch = part[0]
      process.apply(parsed,part)
    }
    if(parsed.lastMatch&&parsed.lastMatch.length+parsed.index !== selector.length) parsed.error("Syntax Error——有未识别语法")
    return parseCache.set(selector, parsed)
  }
  
  //   3. Finder
  // ================

  //   Util
  // -------------------------

  // 将nodelist转变为array
  


  //  DOM related Util
  // --------------------

  var
    root = document.documentElement,
    attrMap = {
      "class" : "className",
      "value" : "value",
      "checked": "checked",
      "disabled": "disabled",
      "href":function(node){
        return "href" in node?node.getAttribute("href",2):node.getAttribute("href")
      }
    },
    nthChild = function(node, n){
      var first = node.firstChild
      if(!first) return 
      return nthNext(first,first.nodeName < "@"? n : n-1)
    },
    nthLastChild = function(node, n){
      var last = node.lastChild
      if(!last) return 
      return nthPrev(last,last.nodeName < "@"? n : n-1)
    },
    // 向前回溯n个节点元素
    nthPrev = function(node, n){
      while(n && (node = node.previousSibling)){
        if(node.nodeName > "@") n--
      }
      return node
    },
    // 向后查找n个节点元素
    nthNext = function(node, n){
      while(n && (node = node.nextSibling)){
        if(node.nodeName > "@") n--
      }
      return node
    },
    hasAttribute = body.hasAttribute? function(node,key){
      return node.hasAttribute(key)
    }:function(node,key){
      return getAttribute(node,key) != null
    },
    getAttribute = function(node,key){
      var map = attrMap[key]
      if(map) return node[map]
      return node.getAttribute(node,key)
    },
    //数组去重
    distinct = function(array) {
      for (var i = array.length; i--;) {
        var n = array[i]
        // 先排除 即 如果它是清白的 后面就没有等值元素
        array.splice(i, 1, null) 
        if (~array.indexOf(n)) {
          array.splice(i, 1); //不清白
        } else {
          array.splice(i, 1, n); //不清白
        }
      }
      return array
    },
    // 从sly(修改自sizzle) 抄袭的 document sorter 
    // 将匹配元素集按文档顺序排列好 这很重要!
    sortor = (doc.compareDocumentPosition) ? function(a, b){
      if (!a.compareDocumentPosition || !b.compareDocumentPosition) return 0;
      return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
    } : ('sourceIndex' in doc) ? function(a, b){
      if (!a.sourceIndex || !b.sourceIndex) return 0;
      return a.sourceIndex - b.sourceIndex;
    } : (doc.createRange) ? function(a, b){
      if (!a.ownerDocument || !b.ownerDocument) return 0;
      var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
      aRange.setStart(a, 0);
      aRange.setEnd(a, 0);
      bRange.setStart(b, 0);
      bRange.setEnd(b, 0);
      return aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
    } : null


  var 
    finders = {
      byId:function(id){
        var node = doc.getElementById(id)
        return node? [node] : [] 
      },
      byClassName:doc.getElementsByClassName?function(classList,node){
        classList == classList.join(" ")
        return toArray((node || doc).getElementsByClassName(classList))
      }:null,
      byTagName:function(tagName, node){
        var results = (node || doc).getElementsByTagName(tagName)
        return toArray(results)
      }
    },
    // filters 这里简化到过滤单个节点 逻辑清晰 性能可能有所损失
    filters = {
      id:function(node,id){
        return node.id === id
      },
      classList:function(node, classList){
        var len = classList.length,
         className = " "+node.className+" "

        for( ;len--; ){
          if(!~className.indexOf(" "+classList[len]+" ")){
            return false
          }
        }
        return true
      },
      tag:function(node, tag){
        if(tag == "*") return true
        return node.tagName.toLowerCase() === tag
      },
      pesudos:function(node, pesudos){
        var len = pesudos.length,
          pesudoFilters = expandFilters["pesudos"]

        for( ;len--; ){
          var pesudo = pesudos[len],
            name = pesudo.name,
            filter = pesudoFilters[name]
          if(!filter) throw Error("不支持的伪类:"+name)
          if(!filter(node, pesudo.param)) return false
        }
        return true
      },
      attributes:function(node, attributes){
        var len = attributes.length,
          operatorFilters = expandFilters["operators"]

        for( ;len--; ){
          var attribute = attributes[len],
            operator = attribute["operator"],
            filter = operatorFilters[operator]

          if(!operator){
            if(!hasAttribute(node,attribute.key)){
              return false
            }
            continue
          }
          if(!filter) throw Error("不支持的操作符:"+operator)
          if(!filter(node, attribute.key, attribute.value)) return false
        }
        return true
      }
    },
    // expandFilters 
    // -------------------------
    // 原生可扩展的方法
    expandFilters = {
      combos: {
        // 这里是神级扩展, 带来了良好的接口，但是对性能略有影响
        // ----------------------------
        // 选择符filter 与其他filter不同 node 同样是当前节点 区别是
        // 如果成功返回成功的上游节点(可能是父节点 可能是兄弟节点等等)
        // 其中 match(node) 返回 这个上游节点是否匹配剩余选择符(内部仍是一个递归)
        ">": function(node,match){
          var parent = node.parentNode
          if(match(parent)) return parent
        },
        "~": function(node,match){
          var prev = nthPrev(node,1)
          while(prev){
            if(match(prev)) return prev
            prev = nthPrev(prev, 1)
          }
        },
        " ":function(node,match){
          var parent = node.parentNode
          while(parent){
            var pass = match(parent)
            if(pass === null) return null // null相当于休止符
            if(pass) return parent
            parent = parent.parentNode
          }
        },
        "+":function(node,match){
          var prev = nthPrev(node, 1)
          if(prev && match(prev)) return prev
        },
        "^":function(node,match){
          var next = nthNext(node, 1)
          while(next){
            if(next && match(next)) return next
            next = nthNext(node, 1)          
          }
        },
        "-":function(node,match){
          var next = nthNext(node,1)
          if(next && match(next)) return next
        }
      },
      operators: {
        "^=":function(node, key , value){
          var nodeValue = getAttribute(node, key)
          if(nodeValue == null) return false
          return nodeValue.indexOf(value) === 0
        },
        "=":function(node, key, value){
          return getAttribute(node,key) == value
        },
        "~=":function(node, key, value){
          var nodeValue = getAttribute(node, key)
          if(nodeValue == null) return false

          var values = nodeValue.split(/\s+/),
            len=values.length

          for(;len--;){
            if(values[len] == value) return true
          }
          return false
        },
        "$=":function(node, key, value){
          var realValue = getAttribute(node, key)
          return typeof realValue == "string" && realValue.lastIndexOf(value)+value.length == realValue.length
        },
        "|=":function(node, key, value){
          var realValue = getAttribute(node,key)||""
          return ~("-"+realValue+"-").indexOf("-"+value+"-")
        },
        "*=":function(node,key,value){
          return ~(getAttribute(node,key)||" ").indexOf(value)
        },
        "!=":function(node,key,value){
          return getAttribute(node,key) !==value
        }
      },
      pesudos: {
        //TODO:这里如果出自 SELECtorAPI 标注下处处
        "not":function(node, sl){
          return !matches(node, sl)
        },
        "contains":function(node,param){
          return ~(node.innerText || node.textContent || '').indexOf(param) 
        },
        "matches":function(node, sl){
          return matches(node, sl)
        },
        // child pesudo
        "nth-child":function(node,param){
          var parent = node.parentNode,
            start = param.start,
            step = param.step,
            traverse = param.step < 0? nthPrev :nthNext,
            absStep = Math.abs(step),
            startNode = nthChild(parent,start)
          //如果step ==0 则只判断一次
          if(step ==0) return startNode === node
          //如果step ==1 并且是从头开始
          if(step ==1 && start <=1) return true
          if(!startNode) return false
          do{
            if(startNode === node) return true
          }while(startNode = traverse(startNode,absStep))
          return false
        },
        "nth-last-child":function(node,param){
          var parent = node.parentNode,
            step = param.step,
            start = param.start ,
            traverse = param.step > 0? nthPrev :nthNext,
            absStep = Math.abs(step)

          if(step ==1 && start <=1) return true

          var startNode = nthLastChild(parent,start)

          if(step ==0) return startNode === node
          //如果step ==1 并且是从头开始
          if(!startNode) return false
          do{
            if(startNode === node) return true
          }while(startNode = traverse(startNode,absStep))
          return false
        },
        "first-child":function(node){
          return nthChild(node.parentNode,1) === node
        },
        "last-child":function(node){
          return nthLastChild(node.parentNode,1) === node
        },
        // type pesudo 没有实现  为什么?
        // 1. 用的不多
        // 2. 开销大 假如type pesudo出现在较深层次的中间部分
        // 3. 实现起来有难度
        "root":function(node,param){
          return node === root
        },
        "only-child":function(node){
          var parent = node.parentNode
          return !nthPrev(node,1) && !nthNext(node,1)
        },
        "checked":function(node){
          return node.checked === true
        },
        "enabled":function(node){
          return node.disabled === false 
        },
        "disabled":function(node){
          return node.disabled === true
        },
        "empty":function(node){
          return node.innerHTML === ""
        },
        "focus":function(node){
          return doc.activeElement === node
        },
        "selected":function(node){
          return node.selected
        }
      }
    },
    // 这里主要是整合之前的ExpandsFilter中的mathch, 单层数据
    matchDatum = function(node, datum, ignored){
      var subFilter
      for(var i in datum){
        if(ignored !==i && (subFilter = filters[i]) && !subFilter(node,datum[i])){
          return false
        }
      }
      return true
    },
    // 将一组数据用datum过滤
    filterDatum = function(results, datum, ignored){
      var len = results.length
      if(!len) return results
      for(; len--;){
        if(!matchDatum(results[len], datum, ignored)) results.splice(len,1)
      }
      return results
    },
    //动态产生供FilterOneNode使用的match
    createMatch = function(datum, context){
      return function(node){
        if(node == context|| node == null) return false //null 相当于休止符
        return matchDatum(node, datum)
      }
    },
    createMatches = function(data , context){
      var matches = []
      for(var i = 0, len = data.length;i < len; i++){
        matches.push(createMatch(data[i],context))
      }
      return matches
    },
    // 判断每一个node是否匹配相应的选择符, 
    // 到这里为止终于把context抛弃，信息封在了matches中
    filterOneNode = function(node,matches,data){
      var len = data.length
      for(;len--;){
        var datum = data[len], 
          getNext = expandFilters.combos[datum.combo],
          next
        if(!getNext) throw Error("不支持的连接符:"+datum.combo)
        if(next = getNext(node,matches[len])){
          node = next
        }else{
          return false
        }
      }
      return true
    },
    // 过滤主函数filter
    // -----------------------------------
    // 自底向上过滤非匹配节点
    filter = function(results,data,context){
      if(!data.length) return results  
      //这里是为了缓存match匹配函数
      var matches = createMatches(data , context) //
      for(var i=results.length; i--; ){
        if(!filterOneNode(results[i],matches,data)){
          results.splice(i,1)
        }
      }
      return results
    },
    getTargets = function(lastPiece, context){
      var results,ignored 
      if(lastPiece.id){ 
        results = finders.byId(lastPiece.id) 
        ignored = "id"
      }else if(lastPiece.classList && lastPiece.classList.length && finders.byClassName){
        results = finders.byClassName(lastPiece.classList, context)
        ignored = "classList"
      }else{
        results = finders.byTagName(lastPiece.tag||"*", context)
        ignored = "tag"
      }
      if(!results.length) return results
      return filterDatum(results, lastPiece, ignored)
    }
  // API 3 : find
  // -------------
  // 根据parse后的数据进行节点查找
  // options:
  //    1. parsed.data  parse数据为一数组
  //    2. node         context节点
  // 事实上没有data这个单词，我这里算是自定了这个单词
  //     datas : [data,data]   
  //     data : [datum, datum]
  //     datum: {tag:"*"....etc}
 
  var find = nes.find = function(datas, context){
    var results = []
    for(var i = 0, len = datas.length ;i<len; i++){
      var data = datas[i],dlen = data.length,
        last = data[dlen-1]
      results = results.concat(filter(getTargets(last, context), data.slice(0,-1), context))
    }
    if(!results.length) return results
    if(len>1) distinct(results)
    results = results.sort(sortor) 
    return results
  } 
  // API 4: 测试用get相当于all
  // -------------------------
  // 为了测试时避免原生querySelector的影响
  // 
  var get = nes.get = function(sl, context){
    var data = parse(sl).data
    return find(data, context||doc)
  }

  // API 5: selector api 2 matches
  // ----------------------------------------------------------------------
  
  var matches = nes.matches = function(node,sl, context){
    
    var data = parse(sl).data[0],
      len = data.length
    context = context || doc
    if(!matchDatum(node, data[len-1],context)){
      return false
    }
   
    return true
  } 
  

  // 直接进行第一次组装
  // ----------------
  cleanRules(rules)  // rule regexp的替换以及字匹配的抽离
  setup()            // 动态组装parser

  // 暴露API:  amd || commonjs || NEJ define || global 
  if (typeof exports === 'object') {
    module.exports = nes
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return nes
    })
  } else if(typeof NEJ == "object" && typeof define =="function"){
    // TODO: 查看NEJ是否支持匿名模块
    define("{pro}extend/nes",function(){
      win.nes = nes 
    })
  }else {
    win.nes = nes
  }
}(window,document)

