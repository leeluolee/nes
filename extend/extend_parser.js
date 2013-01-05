  //      zen-coding dom版本 开始
  // ==============================
  // 这里由于使用到了很多nes中的规则定义，
  // 所以我们直接clone nes的parser
  //
  // __为什么不直接添加新规则到nes.parser中?__
  // 因为例如(li.class)*2 的group或者 repeat都是
  // nes中不需要的 拖缓了速度 还增加了冲突的可能(冲突可通过order来规避，
  // 但是负责的parse还是不建议这样来实现，应该通过手写或者bison这种成熟解析生成)
  var parser2 = nes.parser.clone()
    // 其中pesudos,分隔符也是不需要
    .off(["pesudos","split"])
    // 添加zen-coding中需要的匹配
    .on({
      "group": {
        reg:/\((.*)\)/,
        action:function(all, capture){
          this.current().group = capture
        },
        order:9
      },
      "repeat":{
        reg:/\*([1-9]\d*)/,
        action:function(all, num){
          this.current().repeat = parseInt(num)
        },
        order:8
      }
    })
  // 根据data生成节点
  var createNode = function(option){
    var tag = option.tag,
      group = option.group,
      creater
    if(group){
      node =  create(group)
    }
    else{
      node = document.createElement(tag == "*"? "div":option.tag)
    }
    for(var i in option){
      if(creater = ExpandCreater[i]){
        creater(node, option[i])
      }
    }
    if(option.repeat){//如果重复数
      var parent = document.createDocumentFragment()
      for(var len = option.repeat;len--;){
        parent.appendChild(len ==0?node: node.cloneNode(true))
      }
      return parent
    }
    return node
  }
  var ExpandCreater = {
    //group与tag特殊
    id:function(node, id){
      node.id = id
    },
    classList: function(node, classList){
      node.className = classList.join(" ")
    },
    attributes:function(node, attributes){
      var len = attributes.length, attribute
      for(;len--;){
        attribute = attributes[len]
        node.setAttribute(attribute.key, typeof attribute.value == "undefined"? true : attribute.value)
      }
    }
  }
  var comboFilter = function(prev, node, combo){
    if(combo!==">" && combo!=="+"){
      throw Error("节点创建不能传入非>或+连接符")
    }else{
      if(combo === ">"){
        var parent = prev
        parent.appendChild(node)
      }else{
        parent = prev.parentNode
        if(!parent){
          parent = document.createDocumentFragment()
          parent.appendChild(prev)
        }
        parent.appendChild(node)
      }
      return parent
    }
  }
  // 这里是暴露的api: __create__
  // 传入选择器，生成dom节点(与一般的zen-coding生成字符串不同)
  // 如果顶层节点不是一个，则返回一个documentFragment
  // 如果是group 则进行二次create (group中有group以此类推)
  var create = function(sl){
    var data = parser2.parse(sl)[0],
      len = data.length,
      datum, parent, current, prev
    for(var i = 0; i < len; i++){
      datum = data[i]
      prev = current
      current = createNode(datum)
      if(i!==0){
        var node = comboFilter(prev, current, data[i-1].combo)
        if(!parent) parent = node
      }
    }
    return parent
  }
  var node = create("p#id.m-hd.m-bd>(li#name[tlt=ha].nm1+li.nm2)*2")
  console.log("-----------------zen-coding输出--------------")
  // 这里检查节点，如果信息不全，可以将这个节点
  console.log(node)
  console.log("-----------------zen-coding输出结束--------------")
