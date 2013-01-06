  //      Creator 开始
  // ----------------------
  var parser2 = nes.parser.clone()
    .off(["pesudos","split"])
    .on({
      "group": {
        reg:/\((.*)\)/,
        action:function(all, capture){
          console.log(capture)
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
    });
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
      console.log(parent)
      console.log(node.cloneNode(true))
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
  // API 6: 按Simple Selector生成dom节点
  // __注意只支持单节点__ :即
  // 如:nes.create("p#id.class1.class2")
  var create = function(sl){
    var data = parser2.parse(sl)[0],
      len = data.length,
      datum, parent, current, prev
    for(var i = 0; i < len; i++){
      datum = data[i]
      prev = current
      current = createNode(datum)
      if(i!==0){
        var node = comboFilter(prev, current, data[i-1].combo) //匹配出真正的parent节点
        if(parent === prev) parent = node
      }
      if(!parent) parent = current
    }
    return parent
  }

  var container = nes.one("#create")
  var node = create("(div#container+header#id.m-home.m-name>ul>(li#name[title=haha].name1+li.name2)*2)*2")
  // var node = create("(li#name[title=haha].name1+li.name2)*2")
  console.log(node)
  container.appendChild(node)
