var sls = [

// 要扩展的部分
"ul.test li.trigger & li",
"div[class!=made_up]",
"div:matches(.class1,.class,body .example)",
"div:not([href], body > div.example)",
"h1[id]:contains(Selectors)",
"div:target",
"div:matches(:first-child,:last-child)",
"li:nth-match( 3 of li.trigger)",
"meta % title",
"script & div",
// "ul.test1 > li{,}", // === div:nth-child(n+1):not(nth-child(n+5))   即>=a   <b
"ul.test1 > li{1,9}", // === div:nth-child(n+1):not(nth-child(n+5))   即>=a   <b
"ul.test1 > li:nth-child(n+1):not(:nth-last-child(n+10))", // 相当于上一条
"ul.test1 > li{1,}", //从第一个到最后一个
"ul.test1 > li:nth-child(n+1):nth-last-child(n+1)", // 相当于上一条
"ul.test1 > li{,10}",//从第一个到最后一个
"ul.test1 > li:nth-child(n+1):not(:nth-last-child(n+11))", // 相当于上一条
"ul.test1 > li{1,-2}", //从第一个到倒数第二个，不包括
"ul.test1 > li:nth-child(n+1):nth-last-child(n+2)" // 相当于上一条
]

var log = new _$log(document.getElementById("info"))
var getSelector = function(index){
  if(sls[index]){
    process(sls[index],container)
    setTimeout(function(){
      getSelector(++index)
    },50)
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
      result = "不支持"
      throw e
    }
    try{
      qsa =container.querySelectorAll(sl).length
    }catch(e){
      qsa = "不支持"
    }
    try{
      nw =NW.Dom.select( sl, container).length
    }catch(e){
      nw = "不支持"
    }
    method = typeof result !== "string" && typeof qsa !=="string" && qsa === result  ? "log":"error"
    log[method]("开始尝试'   "+sl+"   ', nes: "+result,
        "<===>原生qsa:"+qsa,"<<=====>>NWM:"+nw)

}
// 把这里的document改成document.getElementById("testContainer")
var container = document //然后蛋疼了、



window.onload=test



