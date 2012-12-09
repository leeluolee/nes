var sls = [
" div",
":last-child input",
":last-child a",
":last-child p",
":last-child td",
":last-child tr",
":last-child table",
":last-child div",
":first-child input",
":first-child a",
":first-child p",
":first-child td",
":first-child tr",
":first-child table",
":first-child div",
"input ~ input",
"td ~ td",
"tr ~ tr",
"div ~ div",
"a ~ a",
"td + td",
"tr + tr",
"div + div",
"a + a",
":first-child ~ :last-child",
"div > table",
"div  table",
"div tr",
"div td",
"div p",
"div input",
":only-of-type",
":checked",
":enabled",
":disabled",
":focus",
":empty",
":target",
":first-child",
":last-child",
":only-child",
":nth-match(3 of a)",
":nth-child(2n+1)"
]



var Support = {
  simpleSelector:{
    tag: "div table tbody tr td p a input".split(" ") ,
    pesudo:":first-child :last-child :last-of-type :first-of-type :only-child :only-of-type :checked :enabled :disabled :empty :focus :target".split(" "),
    nth:":nth-child :nth-last-child :nth-last-of-type :nth-of-type".split(" ")
  },
  nth:["n+1","2n+1","0","1","2","even","odd","-n+1","-3n+7","-3n-9","-1"],
  combo : ["~"," ","+",">"]
}
var simpe = Support.simpleSelector

var createNthTest = function(){
  var nth = Support.nth, 
    len = nth.length,
    nthSelector = Support.simpleSelector.nth

  for(;len--;){
    var nlen = 4
    for(;nlen--;){
      sls.push(nthSelector[nlen]+"("+nth[len]+")")
    }
  }
}

// createNthTest()

var genCompond = function(){
  var result = []
  for(var i in simpe){
    var lists = simpe[i],
      len = lists.length,
      isPush = !result.length || Math.random()>0.9,
      index = Math.floor(Math.random()*len)
    if(isPush) result.push(lists[index])
  }
  return result.join("")
}

var genComplex = function(){
  var result = [],combo = Support.combo,len = combo.length,
    times = 2 //默认声称3组
  result.push(genCompond())
  for(;times--;){
    var index = Math.floor(Math.random()*len)
    result.push(combo[index])
    result.push(genCompond())
  }
  return result.join("")
}

var genSelector = function(){
  var times = 100
  for(;times--;){
    sls.push(genComplex())
  }
}
// genSelector()




var log = new _$log()
var container = window.container= document.getElementById("context")
var getSelector = function(index){
  if(sls[index]){
    process(sls[index],container)
    setTimeout(function(){
      getSelector(++index)
    },100)
  }
}
var test = function(selectors){
  getSelector(0)
}
var process= function(sl,container){
    var result ,qsa,sizzle,nw
    try{
      result = nes._get(sl,container).length
    }catch(e){
      result = "nes失败"
      throw e
    }
    try{
      qsa =container.querySelectorAll(sl).length
    }catch(e){
      qsa = "qsq失败"
    }
    try{
      nw =NW.Dom.select( sl, container).length
    }catch(e){
      nw = "sizzle失败"
    }
    var method = result !==qsa? result!==  nw? "error" : "info" :"log"
    log[method]("开始尝试'   "+sl+"   ', nes: "+result,
        "<===>原生qsa:"+qsa,"<<=====>>sizzle:"+nw)

}
// 把这里的document改成document.getElementById("testContainer")



window.onload=test






