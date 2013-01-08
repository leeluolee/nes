/**
 * Parser  测试
 * @type {[type]}
 */
!function(){
  parser = nes.parser
  this.pe = function(s,arr,info){
    return deepEqual(parser.parse(s),arr,info)
  }
}()

module("Parser", { teardown: moduleTeardown });


test("id、className、tag",function(){
  pe("#id",[[{"tag":"*","id":"id"}]],"basic id #id")
  pe(".home",[[{"tag":"*","classList":["home"]}]],"basic class .home")
  pe("header",[[{"tag":"header"}]] ,"basic tagName header")

  pe("#中文",[[{"tag":"*","id":"中文"}]],"chinese id #中文")
  pe("#id1#id2",[[{"tag":"*","id":"id2"}]],"the next id should replace the first one #id1#id2")
  pe(".home.nav",[[{"tag":"*","classList":["home","nav"]}]],"multiply class .home.nav")
  pe(".中文",[[{"tag":"*","classList":["中文"]}]],"chinese class .中文")
})

test("base pesudo",function(){
  pe(":hello",[[{"tag":"*","pesudos":[{"name":"hello"}]}]],"basic pesudos with no param")
  pe(":hello(2)",[[{"tag":"*","pesudos":[{"name":"hello","param":"2"}]}]] ,"basic pesudos with param")
  pe(":hello(.home.nav#id,nav:first-child)",[[{"tag":"*","pesudos":[{"name":"hello","param":".home.nav#id,nav:first-child"}]}]] ,"pesudos not parse the param")

  pe(":hello:hello2",[[{"tag":"*","pesudos":[{"name":"hello"},{"name":"hello2"}]}]],"multiply pesudos")
  pe(":hello(2):hello2(.home.nav#id,nav:first-child)",[[{"tag":"*","pesudos":[{"name":"hello","param":"2"},{"name":"hello2","param":".home.nav#id,nav:first-child"}]}]],
    "multiply pesudos with params")
})

test("nth-pesudo",function(){
  pe(":nth-child(2)",[[{"tag":"*","pesudos":[{"name":"nth-child","param":{"start":2,"step":0}}]}]] ,"nth-child will convert param")
  pe(":nth-last-child(2)",[[{"tag":"*","pesudos":[{"name":"nth-last-child","param":{"start":2,"step":0}}]}]] ,"nth-last-child convert param")
  pe(":nth-of-type(2)",[[{"tag":"*","pesudos":[{"name":"nth-of-type","param":{"start":2,"step":0}}]}]] ,"nth-of-type convert param")
  pe(":nth-last-of-type(2)",[[{"tag":"*","pesudos":[{"name":"nth-last-of-type","param":{"start":2,"step":0}}]}]] ,"nth-last-of-type convert param")

  pe(":nth-child(3n+1)",[[{"tag":"*","pesudos":[{"name":"nth-child","param":{"start":1,"step":3}}]}]]   ,"convert pos step with pos start")
  pe(":nth-child(-3n+1)",[[{"tag":"*","pesudos":[{"name":"nth-child","param":{"start":1,"step":-3}}]}]]   ,"convert neg step with  pos start")
  pe(":nth-child(-3n-1)",[[{"tag":"*","pesudos":[{"name":"nth-child","param":{"start":-1,"step":null}}]}]]   ,"convert neg step with  neg start")
  equal(nes.parse(":nth-child(-2)")[0][0].pesudos[0].param.step,null, 
    "nth-child with single  negative should return stop flag 'null'")
  pe(":nth-child(n-2)",[[{"tag":"*","pesudos":[{"name":"nth-child","param":{"start":1,"step":1}}]}]]  ,"convert the neg start by the step")
})

test("attribute",function(){
  pe("[title=a]",[[{"tag":"*","attributes":[{"key":"title","operator":"=","value":"a"}]}]] ,"basic = operator")
  pe("[title*=a]",[[{"tag":"*","attributes":[{"key":"title","operator":"*=","value":"a"}]}]] ,"basic *= operator")
  pe("[title!=a]",[[{"tag":"*","attributes":[{"key":"title","operator":"!=","value":"a"}]}]] ,"basic != operator")
  pe("[title^=a]",[[{"tag":"*","attributes":[{"key":"title","operator":"^=","value":"a"}]}]] ,"basic ^= operator")
  pe("[title$=a]",[[{"tag":"*","attributes":[{"key":"title","operator":"$=","value":"a"}]}]] ,"basic $= operator")
  pe("[title~=a]",[[{"tag":"*","attributes":[{"key":"title","operator":"~=","value":"a"}]}]] ,"basic ~= operator")
  pe("[title|=a]",[[{"tag":"*","attributes":[{"key":"title","operator":"|=","value":"a"}]}]] ,"basic |= operator")

  pe("[title=a b]",[[{"tag":"*","attributes":[{"key":"title","operator":"=","value":"a b"}]}]] ,"value width withespace")
  pe("[title=\"a\"]",[[{"tag":"*","attributes":[{"key":"title","operator":"=","value":"a"}]}]] ,"value width \"")
  pe("[title='a']",[[{"tag":"*","attributes":[{"key":"title","operator":"=","value":"a"}]}]] ,"value width '")
  pe("[title=http://localhost/test/index.html]",[[{"tag":"*","attributes":[{"key":"title","operator":"=","value":"http://localhost/test/index.html"}]}]] ,"value width url ")
  pe("[title=/test/index.html]",[[{"tag":"*","attributes":[{"key":"title","operator":"=","value":"/test/index.html"}]}]] ,"value with abs url ")
  pe("[title=#id]",[[{"tag":"*","attributes":[{"key":"title","operator":"=","value":"#id"}]}]] ,"value with anchor")
  pe("[title=http://localhost/test/index.html#id]",[[{"tag":"*","attributes":[{"key":"title","operator":"=","value":"http://localhost/test/index.html#id"}]}]] ,"value width url and anchor")
  pe("[title]",[[{"tag":"*","attributes":[{"key":"title","operator":undefined,"value":undefined}]}]]  ,"value no operator and value")
})

test("combos",function(){
  pe("p a",[[{"tag":"p","combo":" "},{"tag":"a"}]] ,"basic ' '")
  pe("p> a",[[{"tag":"p","combo":">"},{"tag":"a"}]] ,"basic >")
  pe("p+ a",[[{"tag":"p","combo":"+"},{"tag":"a"}]] ,"basic +")
  pe("p~ a",[[{"tag":"p","combo":"~"},{"tag":"a"}]] ,"basic ~")
  pe("p~ a + a +div > a",[[{"tag":"p","combo":"~"},{"tag":"a","combo":"+"},{"tag":"a","combo":"+"},{"tag":"div","combo":">"},{"tag":"a"}]] ,"combo chain")
})


test("selector list test",function(){
  pe("p,a,div",[[{"tag":"p"}],[{"tag":"a"}],[{"tag":"div"}]],"basic test")
  pe("div.example[class=a] ~ p:nth-child(2n+1):not(.toc2,.toc) +span ,body > p:first-child a[href=https://163.com#id],body div.example:not(#id>test)",
    [[{"tag":"div","classList":["example"],"attributes":[{"key":"class","operator":"=","value":"a"}],"combo":"~"},{"tag":"p","pesudos":[{"name":"nth-child","param":{"start":1,"step":2}},{"name":"not","param":".toc2,.toc"}],"combo":"+"},{"tag":"span"}],[{"tag":"body","combo":">"},{"tag":"p","pesudos":[{"name":"first-child"}],"combo":" "},{"tag":"a","attributes":[{"key":"href","operator":"=","value":"https://163.com#id"}]}],[{"tag":"body","combo":" "},{"tag":"div","classList":["example"],"pesudos":[{"name":"not","param":"#id>test"}]}]],
    "complex test")
})
