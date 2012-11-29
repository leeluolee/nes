!function(win, doc){
  var NES = function(){} // namespace

  // debug stuff
  NES.DEBUG = true
  NES.log = function(){
    if(!NES.DEBUG) return 
    else if(window.console&&console.log) {
      // console.log(arguments)
    }
  }


  //          1. Util
  // ==============================
  
  var 
    ap = Array.prototype,
    op = Object.prototype,
    sp = String.prototype,
    fp = Function.prototype,
    slice = ap.slice,

    $ = function(sl){return doc.querySelector(sl)},
    $$ = function(sl){return doc.querySelectorAll(sl)},

    

    typeOf = function(o){
      return o == null? String(o) : 
        op.toString.call(o).slice(8, -1).toLowerCase()
    },
    extend = function(o1, o2, override){
      for(var i in o2){
        if(o1[i] == null || override) o1[i] = o2[i]
      }
    },
    indexOf = function(arr, item){
      var len = arr.length
      for( ;len--;){
        if(arr[len] === item){
          return len
        }
      }
      return -1
    },
    getLast = function(arr){
      // 如果没有，则证明数组为空
      return arr[arr.length-1] || (arr[0] = {tag:"*"})
    }
    // extend native function
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
    //indexOf
    ap.indexOf =ap.indexOf || function(a) {
        for (var i = 0, len = this.length; i < len; i++) {
            if (a === this[i]) return i
        }
        return -1
    }


  //          2. Parser
  // ==============================

  //      util
  // ------------
    
  var 
    esReg = /[-[\]{}()*+?.\\^$|,#\s]/g,
    replaceReg = /\{([^\}]*)\}/g,
    nthReg = /^(?:(\d+)|([+-]?\d*)?n([+-]\d+)?)$/,

    parseError = {}, //TODO: 统一维护ERROR

    // raw Symbols 待组装
    symbols ={
      macros : {
        split:"\\s*,\\s*",
        operator: "[*^$|~!]?=",
        // operator: "[.]?=",
        combines: "[>\\s+~^-](?!=)",
        unicode: "[\\w\\u4e00-\\u9fbf-]"
        //http://www.w3.org/TR/selectors/#nth-child-pseudo
        // nth:/^([+-]?\d*)?n([a-z]+)?([+-]\d+)?|odd|even)$/,
      },
      raws: {
        // "{split}":["SPLIT"],
        "{combines}":["COMBO"],  // flag =>combo
        "#({unicode}+)":["ID","id"], // flag =>id
        "\\.({unicode}+)":["CLASSNAME","klass"], // flag =>klass
        "\\*|{unicode}+":["TAG"], // flag =>tag
        "\\[({unicode}+)(?:({operator})[\'\"]?({unicode}+)[\'\"]?)?\\]":["ATTR","key","operator","value"], //flag => [attk operator attv]
        ":({unicode}+)(?:\\(([^\\(\\)]*)\\))?":["PESUDO","pesudo","param"] // 伪类  // flag => pesudo(param)
        // "::({unicode}+)":["PESUDO_ELEMENT","name"] // 伪元素 => 无解
        // "$":["EOL"]
      },
      subProcess: {
       
        // 这里的this都指代parsed对象

        // COMBO需要知道后续token的类型来判断是否抛出错误
        COMBO: function(all, next){
          // 连接符后必须有token querySelector _抛出异常(Error: SYNTAX_ERR: DOM Exception 12)_
          if(next.type == "COMBO") throw Error("连接符: " + all + " 后不能接连接符")
          if(next.type == "EOL") throw Error("连接符: " + all + " 后必须要有token")
          // 连接符前必须有token  querySelector _抛出异常(Error: SYNTAX_ERR: DOM Exception 12)_
          if(this.data[this.index].length == 0) throw Error("连接符: " + all + " 前必须要有token")

          // 下标前移
          var data =  this.data[this.index]
            current =  getLast(data)
          current.combo = all
          data.push({tag:"*"})//如果后续有tag会 顶替掉这个默认值

          NES.log("combo",arguments)
        },
        ID:function(all, id){
          var current =  getLast(this.data[this.index])
          current.id = id
          NES.log("id",arguments)
        },
        CLASSNAME:function(all, klass){ /* class关键字 */
          var current =  getLast(this.data[this.index]),
            klasses = current.klassNames || (current.klassNames = [])
          klasses.push(klass)  
          // console.log(current)

          NES.log("class",arguments)
        },
        TAG:function(all){
          var data = this.data[this.index], 
            current =  getLast(data)             
          current.tag = all
          NES.log("tag",arguments)
        },
        ATTR:function(all, key, operator, value){
          var current =  getLast(this.data[this.index]),
            attrs = current.attrs || (current.attrs = [])

          attrs.push({key:key,operator:operator,value:value})
          NES.log("attr",arguments)
        },
        PESUDO:function(all, name, param){
          var current =  getLast(this.data[this.index]),
            pesudos = current.pesudos || (current.pesudos = [])
          if(!expandFilter["pesudos"][name]){
            throw Error("不支持的伪类选择器=>"+"contains")
          }
          if(~name.indexOf("nth")){
            var step,start
              param = param.replace(/\s+/g,"")
            if(param == "even"){
              start = 0
              step = 2
            }else if(param == "odd"){
              step = 2
              start = 1
            }else{
              var res = param.match(nthReg)
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
            param = {start:start,step:step}
            // console.log(param)
          } 
          pesudos.push({name:name, param:param})
          NES.log("pesudo", arguments)
        },
        PESUDO_ELEMENT:function(all,name){
        }
      },
      //查找时需要多向前看一位
      forward:{
        "COMBO":1,
        "SPLIT":1
      }
    },
    // accemble做了三件事
    // 1. link symbol
    // 2. 组装 trunk
    // 3. 生成types
    assemble = function(sbl){
      var raws = sbl.raws,
        macros = sbl.macros,
        splits = [],
        map = sbl.map = {},
        types = sbl.types = {},
        typeindex = 0,
        curindex = 1 //代表当前所在reg位置

      // 由raw生成rules
      for(var i in raws){
        var raw = raws[i],
          ni = i.replace(replaceReg, function(a ,b){
            if(b in macros) return macros[b]
            else throw new Error('can"t replace undefined macros:' +b)
          }),
          //TODO:坑不应该由后面的定义数组决定而应该从reg定义中提取
          pits= raw.length // 这个代表每个reg组成所占的坑 

        // 将每个reg塞到相应的坑中
        map[curindex] = [raw[0]]
        map[curindex].push(pits - 1)
        curindex += pits

        types[raw[0]] = Math.pow(2, typeindex++)
        // rules[ni] = raw
        splits.push(ni)
      }
      delete sbl["raws"]
      // 由splits 生成大 trunk
      NES.log(symbols)
      sbl.all = new RegExp("^(?:("+splits.join(")|(")+"))")
      return sbl

    },
    cleanReg = new RegExp("\\s*(,|"+symbols.macros.combines + "|"+symbols.macros.operator+")\\s*","g"),
    // 1.清理空格 保证cache的唯一性
    // 2.可以减少RegExp的冗长
    clean = function(sl){
      return sl.trim()
        .replace(/\s+/," ")
        .replace(cleanReg,"$1")
    },
    createArray = function(len){
      var result = []
      for(var i =0; i < len; i++){
        result.push([])
      }
      return result
    },
    // 主处理函数
    // -------------------------
    //
    // 1. match 消耗token
    // 2. 定位subprocess
    // 3. 具体逻辑在subProcess中

    processor = function(){
      var args = slice.call(arguments),
        len = args.length,
        map = symbols.map,
        forward = symbols.forward,
        subProcess = symbols.subProcess,
        cacheToken = symbols.cacheToken

      for(var i in map){
        var sp = map[i][0]
        if(args[i] != null && subProcess[sp]  ){
          var index = parseInt(i),
            arg = args.slice(index, index+1+map[i][1])

            // 如果已经有向前看的token存在
            if(cacheToken){
              //将此token推进cache进行传入
              cacheToken.arg.push({type:sp,arg:arg})
              subProcess[cacheToken.type].apply(this, cacheToken.arg)
              symbols.cacheToken = null
            } 
            // 如果有向前看需求 则推入cacheToken在下一个process进行处理
            if(forward[sp]){
              symbols.cacheToken = {type:sp,arg:arg}
              return ""
            }

          // this 指代parsed 即目前parse的进度 
          // 例如“tag.kals:hover(a)[name^=xx],haha > haha ” 会生成如下结构
          //      tag ["tag"] 
          //      class [".kals", "kals"] 
          //      pesudo [":hover(a)", "hover", "a"] 
          //      attr ["[name^=xx]", "name", "^=", "xx"] 
          //      tag ["haha"] 
          //      COMBO [">"] 
          //      tag ["haha"] 
          subProcess[sp].apply(this, arg)
        }
      }
      return ""
    }


    assemble(symbols) // 分析组装symbols 

  //      parse loop
  // ---------------------------
  
  var cache = NES.parseCache = {},
    maxCahce = NES.maxCache = 1000, //TODO应该增加最大缓存顶点
    currentCache = 0
    
  var parse = NES.parse = function(selector){
    // 1. 除去多余空格
    var key = selector = clean(selector)  
    if(cache[key]) return cache[key]
      
    var parts = selector.split(","),
      pLen = parts.length,
      parsed = {}
      //存放parse通过的数据
      parsed.data = createArray(pLen)
      // 代表当前parse到的selector部分(被“,”分割的部分)
      parsed.index = 0  

    for(var i = 0; i < pLen; i++){
      var selector = parts[i]
      // 检测分隔符前后语法错误
      if(selector === "") throw Error("分隔符','前后不能为空")
      while (selector != (selector = selector.replace(symbols.all, processor.bind(parsed))));
      // 检测是否有语法未被parse 统一认为是语法错误
      if(selector !== "") throw Error("SELECTOR SYNTAX_ERR")

      // 如果有需要向前的没有被运行 证明终止
      if(symbols.cacheToken){
        symbols.cacheToken.arg.push({type:"EOL"})
        symbols.subProcess[symbols.cacheToken.type].apply(parsed,symbols.cacheToken.arg)

      } 
      parsed.index += 1
    }
    return (cache[key] = parsed)
  }

  //                3.finder
  // ======================================
  
  //  util
  // ------

  var testDiv = document.createElement("div")
  testDiv.style.display = "none"
  document.body.appendChild(testDiv)

  
  var attrMap = {
    "class" : "className",
    "value" : "value",
    "checked": "checked",
    "disabled": "disabled",
    "enabled": function(node){return !node.disabled}
  }
  var 
    nthChild = function(node, n){
      if(n<1) throw Error("n必须大于0")
      var first = node.firstChild
      if(first.nodeType !== 1) first = nextSibling(first,1)
      if(n===1||!first) return first
      return nextSibling(first,n-1)
    },
    nthLastChild = function(node, n){
      if(n<1) throw Error("n必须大于0")
      var last = node.lastChild
      if(last.nodeType !== 1) last = previousSibling(last,1)
      if(n===1 ||!last) return last
      return previousSibling(last, n-1)
    },
    previousSibling = function(node, n){
      if(n<1) throw Error("n必须大于0")
      var prev = node.previousSibling
      while(prev&&prev.nodeType!==1){
        prev = prev.previousSibling
      }
      if(n<=1||!prev) return prev
      return previousSibling(prev,n-1)
    },
    nextSibling = function(node, n){
      if(n<1) throw Error("n必须大于0")
      var next = node.nextSibling
      while(next&&next.nodeType!==1){
        next = next.nextSibling
      }
      if(n===1||!next) return next
      return nextSibling(next,n-1)
    },
    hasAttribute = testDiv.hasAttribute? function(node,key){
      return node.hasAttribute(key)
    }:function(node,key){
      return getAttribute(node,key) != null
    },
    getAttribute = function(node,key){
      var map = attrMap[key]
      if(!map) return node.getAttribute(key)
      else{
        if(typeof map ==="string"){
          return node[map]
        }else{
          return map(node)
        }
      }
    }


 
 var nthFilter = {

 }
  // 开发者可供扩展的hook
  var expandFilter = {
      pesudos:{
        // 注意避免 not matches nest
        "not":function(node, sl){
          return !NES.matches(sl,node)
        },
        "contains":function(node,param){
          return ~(node.innerText || node.textContent || '').indexOf(param) 
        },
        //注意不要nest not matches
        "matches":function(node, sl){
          return NES.matches(sl,node)
        },
        // child pesudo
        "nth-child":function(node,param){
          var parent = node.parentNode,
            start = param.start,
            step = param.step,
            traverse = param.step < 0? previousSibling :nextSibling,
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
            traverse = param.step > 0? previousSibling :nextSibling,
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
          return node === doc
        },
        "only-child":function(node){
          var parent = node.parentNode
          return node == nthChild(node.parentNode,1)&&!parent.childNodes.length
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
          return typeOf(node.firstChild) === null
        }

      },
      combos:{
        ">": function(node,context){
          var parent = node.parentNode
          if(parent === context) parent =null
          return {
            end:true,
            node: parent
          }
        },
        "~": function(node,context){
          var prev = previousSibling(node,1)
          return {
            node:prev
          }
        },
        " ":function(node,context){
          var parent = node.parentNode  
          return {
            node:parent == context? null:parent
          }
        },
        "+":function(node,context){
          var prev = previousSibling(node,1)
          return {
            end:true,
            node:prev
          }
        },
        "^":function(node,context){
          var next =  nextSibling(node,1)
          return {
            node:next
          }
        },
        "-":function(node,context){
          var next =  nextSibling(node,1)
          return {
            end:true,
            node:next
          }
        }
      },
      attrs:{
        "^=":function(node, key , value){
          var nodeValue = getAttribute(node, key)
          if(nodeValue == null) return false
          return getAttribute(node, key).indexOf(value) === 0
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
          return realValue.lastIndexOf(value)+value.length == realValue.length
        },
        "|=":function(node, key, value){
          var realValue = getAttribute(node,key)||""
          return ~("-"+realValue+"-").indexOf("-"+value+"-")
        },
        "*=":function(node,key,value){
          return ~getAttribute(node,key).indexOf(value)
        },
        "!=":function(node,key,value){
          return getAttribute(node,key) !==value
        }
      }
    }
    
  // DOM utils
  // ---------
  var hasClassNameFn = !!doc.getElementsByClassName,
    csplit = /\s+/g, // 是否原生支持
    toArray = function(arr){
      return slice.call(arr)
    }
    try{
      slice.call(document.getElementsByTagName("body"))
    }catch(e){
      toArray = function(arr){
        var result = [],len=arr.length
        for(var i =0;i<len;i++){
          result.push(arr[i])
        }
        return result
      }
    }



  var finder = {
    byId:function(id){
      return [doc.getElementById(id)]
    },
    byClassName:hasClassNameFn?function(klassNames,node){
      if(typeOf(klassNames) === "array") klassNames == klassNames.join(" ")
      return toArray((node || doc).getElementsByClassName(klassNames))
    }:null,
    byTagName:function(tagName, node){
      var results = (node || doc).getElementsByTagName(tagName)
      return toArray(results)
    }
  },
  _filter = {
    klassNames : function(klassNames, node){
      if(typeOf(klassNames) === "string") klassNames = klassNames.split(csplit)
      var len = klassNames.length,className = " "+node.className+" ",classList = node.classList
      for(; len--; ){
        if(classList&&!classList.contains(klassNames[len])||!~className.indexOf(" "+klassNames[len]+" ")){
          return false
        }
      }
      return true
    },
    id:function(id, node){
      return node.getAttribute("id") === id
    },
    tag:function(tag, node){
      if(tag === "*") return true
      return node.tagName.toLowerCase() == tag
    },
    _pesudo:function(pesudo,node){
      var name = pesudo.name,
        filter = expandFilter.pesudos[name]
      if(filter){
        return filter(node,pesudo.param)
      }else{
        throw Error("不支持pesudo:"+pesudo.name)
      }
      return false
    },
    pesudos:function(pesudos, node){
      var len = pesudos.length
      for(;len--;){
        if(!_filter._pesudo(pesudos[len],node)){
          return false
        }
      }
      return true
    },
    _attr:function(attr,node){
      var key = attr.key,operator = attr.operator
      if(typeof operator == "undefined") return hasAttribute(node,key)
      var value = attr.value
      return expandFilter.attrs[operator](node,key,value)
    },
    attrs:function(attrs, node){
      var len = attrs.length
      for(;len--;){
        if(!_filter._attr(attrs[len],node)){
          return false
        }
      }
      return true
    },
    // 这里的data代表一份数据 如:
    //    {id:xx,klassNames:[...]}
    matches:function(data, node, ignored){
      for(var i in data){
        if(i !==ignored){
          var filter = _filter[i]
          if(filter && !filter(data[i],node)){
            return false
          }
        }
      }
      return true
    }
  },

  // 递归向上排除不符合的节点
  filter = function(datas,start,result){
    var data = datas[start],
      combo = expandFilter.combos[data.combo](result,context),
      next=combo.node
    if(!next||next == doc){return false}   
    if(!_filter.matches(data,next)){
      if(!combo.end){
        return filter(datas,start,next)
      }else{
        return false
      }
    }else{
      if(start ===0 ){ //证明寻到了最顶节点
        return true
      }else {
        return filter(datas,start-1,next)
      }
    }
  }
  filter.matches = function(data,results,ignored){
    var len = results.length
    for(;len--;){
      if(!_filter.matches(data,results[len],ignored)){
        results.splice(len,1)
      }
    } 
    return results
  }

  // Find 主逻辑 开始
  // ----------------
  
  // 找到初始目标节点，再以此开始filter
  var getResults = function(lastPiece, node){
    var results,ignored 
    node = node ||doc
    if(lastPiece.id){ 
      results = finder.byId(lastPiece.id) 
      ignored = "id"
    }else if(lastPiece.klassNames&&lastPiece.klassNames.length&&hasClassNameFn){
      results = finder.byClassName(lastPiece.klassNames, node)
      ignored = "klassNames"
    }else{
      results = finder.byTagName(lastPiece.tag||"*", node)
      ignored = "tag"
    }
    filter.matches(lastPiece,results,ignored)

    return results
  }

  //from sizzle document sorter
  var sortor = (doc.compareDocumentPosition) ? function(a, b){
    if (!a.compareDocumentPosition || !b.compareDocumentPosition) return 0;
    return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
  } : ('sourceIndex' in doc) ? function(a, b){
    if (!a.sourceIndex || !b.sourceIndex) return 0;
    return a.sourceIndex - b.sourceIndex;
  } : (document.createRange) ? function(a, b){
    if (!a.ownerDocument || !b.ownerDocument) return 0;
    var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
    aRange.setStart(a, 0);
    aRange.setEnd(a, 0);
    bRange.setStart(b, 0);
    bRange.setEnd(b, 0);
    return aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
  } : null ;
  //去重
  var distinct = function(array) {
    for (var i = array.length; i--;) {
      var n = array[i]
      array.splice(i, 1, null)
      if (array.indexOf(n) < 0) {
        array.splice(i, 1, n); //不存在重复
      } else {
        array.splice(i, 1); //存在重复
      }
    }
    return array
  }


  // 找到parse提供的数据所指向的数据
  var findOnePart = function(raw,node){
    var
      piece,
      len = raw.length-1,
      lastPiece = raw[len],
      results = getResults(lastPiece,node),
      data = raw.slice(0,-1)
    // TODO 当data链的中间出现id 应该要做一次优化
    if(len == 0) return results
    for(var rLen=results.length;rLen--;){
      if(!filter(data,len-1,results[rLen])){
        results.splice(rLen,1)
      }
    }
    return results
  }

  // Find 入口
  // ---------
  
  var context
  var find = NES.find = function(parsed,node){
    var datas = parsed.data,
      len = datas.length,
      results = []
    context = node //小心这个是全局变量
    for(var i =0;i<len;i++){
      results = results.concat(findOnePart(datas[i],node))
    }
    if(len>1) distinct(results)
    results = results.sort(sortor) 
    context = null
    return results
  }

  var matches = NES.matches = function(selector, node){
    if(arguments.length !== 2) throw Error("matches需要两个参数")
    var data = parse(selector).data[0],len=data.length
    if(!_filter.matches(data[len-1],node)) return false
    else if(len>1){
      return filter(data, len-2, node)
    }else{
      return  true
    }
  }


  //                4.assemble
  // ==============================================================================

  var createSetter = function(host, name){
    var setter = function(key , fn){
      if(typeOf(key) === "object"){
        for(var i in key){
          setter(i,key[i])
        }
      }else{
        if(typeOf(host[key] !== "function")) host[key] = fn
      }
    }
    NES[name] = setter
  }
  // ！创建两个扩展方法 pesudo与combo供后续增强
  //  1. pesudo 增加
  //  2. combo 增加
  //  3. attr 增加 
  //  后续可以通过NES.pesudo(key,function(){}) 增强
  createSetter(expandFilter.pesudos, "pesudo")
  createSetter(expandFilter.combos, "combo")
  createSetter(expandFilter.attrs, "attr")

  // get是一个私有函数用以测试非原生的函数
  var get = NES.get = function(sl, node){

    var parsed = parse(sl)
    return NES.find(parsed,node)
  }

  // one  ===  querySelectorAll
  var one = function(sl, node){

  }

  // all ===   querySelectorAll
  var all = function(sl, node){

  }

  testDiv.parentNode.removeChild(testDiv)
  if (typeof exports === 'object') {
    module.exports = NES
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return NES
    });
  } else {
    win.NES = NES
  }
}(window, document)
