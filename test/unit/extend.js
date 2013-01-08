module("Extend", { teardown: moduleTeardown});

test("pesudos",function(){
  nes.one("#nes_test").innerHTML ='<div id="nes_extend_pesdudo"> <ul> </ul> </div>'
  nes.pesudos("include",function(node, param){
    return !!nes.one( param, node)
  })
  t("include pesudos","#nes_test div:include(ul)",["nes_extend_pesdudo"])
  nes.one("#nes_test").innerHTML = ""
})

test("combos",function(){
  nes.one("#nes_test").innerHTML ='<div id="nes_extend_combo"> <div id="nes_extend_combo_first"></div> <div id="nes_extend_combo_two"></div> </div>'
  nes.combos({
    // 相当于 ~ 的相反版   
    "&":function(node,match){
      while(node = node.nextSibling){
        if(node.nodeType ===1 && match(node)){
          return node
        }
      }
      return null
    },
  // 与 + 相反
    "%":function(node,match){
      while(node = node.nextSibling){
        if(node.nodeType ===1) return match(node)? node :null
      }
    }
  })
  t("% combos","#nes_extend_combo_two % div",["nes_extend_combo_first"])
  nes.one("#nes_test").innerHTML = ""
})

test("operators",function(){
  nes.one("#nes_test").innerHTML = '<div id="nes_extend_operator" title="hello_test_1"></div>'
  nes.operators("&=", function(value, nodeValue){
    return ~("_"+nodeValue+"_").indexOf(value)
  })
  t("&= operator","#nes_test [title&=test]",["nes_extend_operator"])
  nes.one("#nes_test").innerHTML = ""
})

test("parser.on add new Simple Selector syntax",function(){
  nes.one("#nes_test").innerHTML = '<div id="nes_extend_rule"> <p></p> <p></p> <p id="nes_extend_rule_3"></p> <p id="nes_extend_rule_4"></p> <p id="nes_extend_rule_5"></p> <p></p> </div> '
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

  t("new rule range ","#nes_test p{3,5}",["nes_extend_rule_3","nes_extend_rule_4","nes_extend_rule_5"])
  nes.one("#nes_test").innerHTML = ""
})
