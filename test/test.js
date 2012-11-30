var sls = [
"p:not(.example:nth-child(even)) a:first-child",
"p:matches(.example:nth-child(even)) a:first-child"
"p + p ~ p>a:first-child",
"div.中文",
"a:first-child",
//简单id class tag
".note",
"#title",
"h1#title",
"div #title",
"div.example",
"ul .tocline2",
".title",
".toc",
".toc .tocline2",
".tocline2, .tocline3, .tocline4",
"div.example, div.note",
"body",
"div",
//各种连接符  //我草 body 在container外面了 也可以取到？
"body p",
"body div",
"div p",
"div > p",
"div + p",
"div ~ p",
"div[class^=exa][class$=mple]",
"div p a",
"div > p > a",
"div.example > p > a",
"div + p + a",
"div ~ p ~ p",
"div, p, a",
"ul.toc li.tocline2",
"ul.toc > li.tocline2",
"h1#title + div > p",
//各种属性
"a[href][lang][class]",
"div[class]",
"div[class=example]",
"div[class^=exa]",
"div[class$=mple]",
"div[class*=e]",
"div[class~=example]",
"div:not(.example)",
//各种nth 
"p:nth-child(even)",
"p:nth-child(2n)",
"p:nth-child(odd)",
"p:nth-child(5n+1)",
"p:nth-child(3n-11)",
"p:nth-last-child(5n+1)",
"p:nth-last-child(3n-11)",
"p:nth-last-of-type(5n+1)",
"p:nth-last-of-type(3n-11)",
"p:nth-of-type(3n+1)",
"p:only-child",
"p:last-child",
"p:first-child",
"p:only-of-type",
"p:last-of-type",
"p:first-of-type",
"div ul:include(li.trigger)",
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
"title + meta",
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



