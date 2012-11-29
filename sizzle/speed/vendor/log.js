!(function(){

  var 
    _addStyle = function(text){
      var style=document.createElement('style'),el=document.body;
        style.type='text/css';
        if(!-[1,] && el.filters){ //ie6 ~ 8 
            style.styleSheet.cssText=text;
        }else{
            var frag=document.createDocumentFragment();
            frag.appendChild(document.createTextNode(text));
            style.appendChild(frag);
        }
        document
          .getElementsByTagName('head')[0]
          .appendChild(style);
    },
    _log = window._$log = function(_container){
      this._container = _container || document.body
      this._list = document.createElement("ul")
      this._list.className = "m-log"
      this._container.appendChild(this._list)
    },
    _proLog = _log.prototype,
    _api = "log info error".split(" ");

    for(var i = _api.length;i--;){
      (function(i){
        var name = _api[i];
        _proLog[name] = function(text){
          if(arguments.length>1){
            text = [].slice.call(arguments).join(" ")
          }
          var li = document.createElement("li");
          li.className = name
          li.innerHTML = text        
          this._list.appendChild(li)
        }
        _proLog["$"+name] = function(text){
          this._list.innerHTML = ""
          this[name](text)
        }
      })(i);
    }
  _addStyle("\
    body,ul{padding: 0; margin: 0; }\
    .m-log {list-style: none;padding: 0;color: #666;}\
    .m-log li{position:relative; padding-left:22px;font-size:16px;  line-height: 32px;font-weight: bold;border-bottom: 1px solid #ccc;box-shadow: 0px 1px 1px #ccc;background: #eee;}\
    .m-log li:before {position: absolute; font-size: 16px; font-weight: bold; left: 1px; }\
    .m-log .log:before {content: '√ '; color: #468847; }\
    .m-log .error:before{content: '\\0000D7 '; color: #b94a48;}\
    .m-log .info:before{content: 'i '; color: #F89406; left: 5px}")

})()

