var sls = [
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
"h1[id]:contains(Selectors)",
"a[href][lang][class]",
"div[class]",
"div[class=example]",
"div[class^=exa]",
"div[class$=mple]",
"div[class*=e]",
"div[class|=dialog]",
"div[class!=made_up]",
"div[class~=example]",
"div:not(.example)",
"p:contains(selectors)",
"p:nth-child(even)",
"p:nth-child(2n)",
"p:nth-child(odd)",
"p:nth-child(5n+1)",
"p:nth-child(3n-11)",
"p:nth-child(n)",
"p:only-child",
"p:last-child",
"p:first-child"

]

// var on = function(node,type,callback){
//   var types = type.split(/\s*->\s*/),
//     type=types[0],
//     matches = types[1]
//   if(!matches) return node.addEventListener(type,callback,false)  
//   node.addEventListener(type,function(e){

//     //这里将只有匹配 没有首次遍历的开销
//     e.preventDefault()
//     console.log(e.target,matches)
//     if(NES.matches(matches,e.target)){
//       e.sourceNode = node
//       callback.call(e.target,e)
//     } 
//   },false)
// }
var log = new _$log(document.getElementById("info"))
var start = function(){
  var len = sls.length
  for(var i =0;i<len;i++){
    var sl = sls[i]
    var result =  nes.get(sl),qsa
    try{
      qsa =document.querySelectorAll(sl).length
    }catch(e){
      qsa = "不支持"
    }
    method = typeof qsa !=="string" && qsa === result.length ? "log":"error"
    log[method]("'   "+sl+"   '开始尝试,有"+result.length,
        "原生qsa:"+qsa)
  }
  console.log(Q("div.example[class] p:nth-child(2n),p.content ~ span", document))

}

window.onload=start





