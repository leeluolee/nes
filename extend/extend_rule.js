// 在进行语法扩展时reg是必须的，
// action与filter至少需要需要二选其一(根据场景不同)才能完成一个自定义规则的实施, 否则虽然不会报错
// 但是只是匹配了，让解析不报错，但是这个选择器什么都不会做
// 
// 
// 获得 li{1,9} 位置为1到9的所有li元素
nes.parser.on("range",{
  reg:/\s*\{\s*(\d*),(\-?\d*)\s*\}\s*/, 
  // action中需要注意两个部分一个是this.error()打印出解析错误信息，
  // 一个this.current()永远返回当前的Simple Selector对应的data部分这是个hash表，
  // 你往里放key value对就行
  action:function(all, a, b){
    var current = this.current(), //1. this.current返回当前匹配的simple selector
      pesudos = current.pesudos || (current.pesudos = []) 
    if(!a && !b) this.error("range中的参数不能同时为空") //2. this.error
    a = a && parseInt(a) || 1
    b = b && parseInt(b) || 0
    pesudos.push({  //a 如果不存在 视为
      name:"nth-child",
      param:{start:a, step:1 }
    })
    if(b>0){
      pesudos.push({ //意思小于b
        name:"not",
        param:":nth-child(" + (b+1) + ")"
      })
    }else{
      pesudos.push({  
        name:"nth-last-child",
        param:{start:b?-b:1, step:1 }
      })
    }
  }
})

nes.parser.on("bind",{
  reg: /\{(['"]?)(\w+)\1\}/,
  action:function(all, bind){
    this.current().bind = bind;
  },
  filter:function(node, bind){
    var bindStr = node.getAttribute("data-bind");
    return bindStr && bindStr.trim().split(/[\r\n\s]*,[\r\n\s]*/).some(function(str){
      return ~str.trim().indexOf(bind)
    })
  }
})

