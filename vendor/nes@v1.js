// NES 原始版
    var _cache = {},
        sepIndex;

    // uitl for parser
    var _unicode = "(?:[\\w\\u00a1-\\uFFFF-])"; //使得选择器可以支持中文等unicode
    var _regstr = "^(?:\\s*(,)\\s*" + //分隔符
    "|(\\s+)" + //连接符
    "|\\#(<unicode>+)" + //id
    "|(<unicode>+|\\*)" + //tagName
    "|\\.(<unicode>+)" + //className 可能有多个
    "|$)"; //end stop => fixed 丢失最后一段node的错误
    var _reg = new RegExp(_regstr.replace(/<unicode>/g, _unicode)); //主parser_regexp

    /**
     * //TODO :可以考虑 exposure 这个部分
     * parse 传入的 选择器信息 _$get的工具方法
     * @param  {String} selector 类似 li.more  a#blog span.u-arr.u-arr-1
     * @return {JSON} json信息数据 供finder使用 形如
     *   {
     *     parsed :true,
     *     extracts: [ // 抽离信息 “,” 分割的部分为一组 如 li.more a.hover, p span
     *      [{tag : "li",classLists:["more"]},{tag:"a",classLists:["more"]}], // 每个 空格分割的为一部分 如li.more   a.hover
     *        [//other]
     *      ]
     */

    function _parser(_selector) {
        /**
         * _result 存储json结果 _part 对应每一个“，”分割的部分 _curnode对应每一个" "
         * 对应的部分
         */
        var _result, _part = [],
            _curnode = {},
            _sepIndex = -1,
            _combIndex = -1,
            _extracts;
        // 清理选择器名 以获得唯一的缓存键值
        _selector = _clean(_selector).replace(/(?:\s+(,)\s+)/, "$1");
        if (_cache[_selector]) return _cache[_selector];
        _result = {
            parsed: true,
            extracts: [],
            raw: _selector
        }
        _extracts = _result.extracts;
        // 调用处理函数processer  
        while (_selector != (_selector = _selector.replace(_reg, _processor)));
        return (_cache[_selector] = _result)
        /**
         * parse的 主处理函数
         * @param  {String} _raw
         * @param  {String} _sep
         * @param  {String} _comb
         * @param  {String} _id
         * @param  {String} _tag
         * @param  {String} _class
         * @param  {string} _end   //_end 是终止符 其实捕获不到的 !不能用 if(_end)
         * @return {[type]}
         */

        function _processor(_raw, _sep, _comb, _id, _tag, _class, _end) {
            if (_raw === "") { // 证明捕获到了休止符
                _extracts.push(_part)
                _part.push(_curnode)
            }
            if (_sep) { // 分隔符  ","
                _part.push(_curnode)
                _curnode = {};
                _extracts.push(_part);
                _part = [];
            }
            if (_comb) { // 连接符  " "
                _part.push(_curnode)
                _curnode = {}
            }
            if (_id) _curnode.id = _id;
            if (_tag) _curnode.tag = _tag;
            if (_class)(_curnode.classLists || (_curnode.classLists = [])).push(_class);
            return "" // 没匹配一次 消除这部分 进入下一次process
        }
    }

    // 选择器 finder 部分
    // -------------------------
    /**
     * 测试节点 是否包含所有className
     * @param  {[type]} _node      [description]
     * @param  {[type]} _classList [description]
     * @return {[type]}
     */

    function _matchClassList(_node, _classList) {
        if (!_classList || !_classList.length) return true;
        for (var _i = _classList.length; _i--;) {
            if (!_$hasClass(_node, _classList[_i])) return false;
        }
        return true;
    }
    /**
     * 测试节点是否满足 id className tag要求 传入参数为parser提供
     * @param  {HTMLElement} _node      节点
     * @param  {String} _id        id
     * @param  {[type]} _classList [description]
     * @param  {[type]} _tag       [description]
     * @return {[type]}
     */

    function _testNode(_node, _id, _classList, _tag, test) {
        if (test) console.log(_classList)
        return (!_id || _node.id === _id) && (!_classList || _matchClassList(_node, _classList)) && (!_tag || _tag == "*" || _node.tagName.toLowerCase() === _tag)
    }
    /**
     * _checkNode 的单步模式
     * @param  {[type]} _node   [description]
     * @param  {[type]} _before [description]
     * @return {HTMLElement}
     */

    function _checkNodeOneStep(_node, _before) {
        while (_node = _node.parentNode) {
            if (_testNode(_node, _before.id, _before.classLists, _before.tag)) {
                return _node;
            }
        }
    }
    /**
     * 判断此节点满足前溯关系    详见_finder
     * @param  {HTMLElement} _node    当前测试节点
     * @param  {NodeList} _befores 祖先节点数组(有上下关系)
     * @return {true}
     */

    function _checkNode(_node, _befores) {
        if (!_befores.length) return true; //如果已经没有前溯节点
        for (var _i = _befores.length; _i--;) {
            if (_node = _checkNodeOneStep(_node, _befores[_i])) {
                if (_i === 0) {
                    return true
                };
                continue;
            }
            // 一旦发现 无法 解析某一层 立即中断回溯
            return false;
        }
    }
    /**
     * 即getElementById的便利方法
     * @param  {String} _id id
     * @return {HTMLElement}
     */

    function _byId(_id) {
        return _doc.getElementById(_id)
    }

    /**
     * 通过className获取节点  _finder的组成
     * @param  {String|Array} _className 待查className(s)
     * @param  {HTMLElement} _node      父节点 (可选 默认为docment)
     * @param  {String} _tagName   节点名(可选 默认为*) 通配符有严重的性能问题
     *                             按NEC的规范，className会频繁使用 尽量加上_tagName
     * @return {NodeList}
     */

    function _byClass(_className, _node, _tagName, findOne) {
        _node = _node || _doc;
        var _result = [],
            _cur;
        if (_doc.getElementsByClass) return _node.getElementsByClass(_className)
        var _backUpNodes = _node.getElementsByTagName(_tagName || "*")
        for (var _i = 0, _len = _backUpNodes.length; _i < _len; _i++) {
            _cur = _backUpNodes[_i];
            if (_$hasClass(_cur, _className)) {
                _result.push(_cur);
            }
        }
        return _result;
    }
    /**
     * getElementsByTagName
     * @param  {String} _tagName tagName
     * @param  {HTMLElement} _node    Node
     * @return {NodeList}
     */

    function _byTag(_tagName, _node) {
        return (_node || _doc).getElementsByTagName(_tagName);
    }

    /**
     * 数组去重 目的是取出 有多个选择器指向同一节点的情况
     * @param  {Array} _array 待操作数组
     * @return {Array}
     */

    function _distinct(_array) {
        for (var _i = _array.length; _i--;) {
            var n = _array[_i];
            _array.splice(_i, 1, null);
            if (_array.indexOf(n) < 0) {
                _array.splice(_i, 1, n); //不存在重复
            } else {
                _array.splice(_i, 1); //存在重复
            }
        }
        return _array;
    }
    /**
     * 通过parser传入的hash信息 找到应有的节点 _$get 的工具方法
     * //TODO: 当调用_$getOne时 应该搜寻到一个元素后就返回
     * @param  {JSON} _parsed parser 提供的解析数据
     * @param  {HTMLElement} _node  追溯父节点
     * @return {NodeList}
     */

    function _finder(_parsed, _node, _onlyOne) {

        var _id, _l, _cur, _last, _tag, _backUpNodes, _extracts = _parsed.extracts,
            _len = _extracts.length,
            _result = [];

        for (var _i = 0; _i < _len; _i++) {
            _cur = _extracts[_i];
            _l = _cur.length;
            _last = _cur[_l - 1];
            _cur = _cur.slice(0, -1);
            // 如果目标节点已经有#id信息
            // 我们认为id因是全页面唯一的
            if (_id = _last.id) {
                _result.push(_byId(_id));
                continue;
            }
            // 因为不支持 伪类 没有明确的位置关系 
            // 所以统一采用从后到前的追溯方向
            _tag = _last.tag || "*";
            if (_last.classLists && _last.classLists.length) {
                _backUpNodes = _byClass((_last.classLists[0]), _node, _tag)
                var _lists = _last.classLists.slice(1);
                for (var _k = _backUpNodes.length; _k--;) {
                    if (!_matchClassList(_backUpNodes[_k], _lists)) _backUpNodes.splice(_k, 1);
                }
            } else {
                _backUpNodes = _byTag(_tag, _node)
            }
            // 如果备选节点不存在 则进入下一组判断
            if (!_backUpNodes || !_backUpNodes.length) continue;
            // 游历 这些 备份节点
            for (var _j = _backUpNodes.length; _j--;) {

                var _node = _backUpNodes[_j];
                if (_checkNode(_node, _cur)) _result.push(_node)
            }
        }
        return _distinct(_result);
    }
    // 整合 parser 与 finder 两部分
    // ----------------------------------------------------------------------
    /**
     * [_get description]
     * @param  {[type]} _selector [description]
     * @param  {[type]} _node     [description]
     * @return {[type]}
     */

    function _get(_selector, _node) {
        return _finder(_parser(_selector), _node);
    }
    /**
     * 简单选择器 其实按NEC的模块化思路 这种选择器也95%够用
     * 相关实现见parser 与finder
     * @param  {[type]} _selector [description]
     * @param  {HTMLElement} _node  父节点 (optional 默认document)
     * @return {NodeList}
     */

    function _$get(_selector, _node) {
        _node = _node || _doc;
        if (_node.querySelectorAll!==undefined&&!/msie/.test(navigator.userAgent.toLowerCase())){
            return slice.call(_node.querySelectorAll(_selector));
        } 
        return _get(_selector, _node);
    }
    /**
     * _$get的单节点缓冲版本
     * @return {HTMLElement}
     */

    function _$getOne(_selector, _node) {
        _node = _node || _doc;
        if (_node.querySelector) return _node.querySelector(_selector)
        return _get.apply(null, arguments)[0];
    }
    //获取满足选择器条件的父节点 _selector 只提供一级查询 如tag#id.class
    function _$getParent(_selector,_node){
        var _parent=_node,_parsed = _parser(_selector),_match=_parsed.extracts[0][0];
        while(_parent = _parent.parentNode){
            if(_testNode(_parent,_match.id,_match.classLists,_match.tag)) return _parent;
        }
        return false;
    }

      // var parent = node.parentNode,
        //   step = param.step,
        //   start = param.start ,
        //   type = isType && node.nodeName,
        //   traverse = param.step > 0? next : prev,
        //   absStep = Math.abs(step)
        // if(step ==1 && start <=1) return true

        // var startNode = getStart(parent,start,type)
        // if(step ==0) return startNode === node
        // //如果step ==1 并且是从头开始
        // if(!startNode) return false
        // do{
        //   if(startNode === node) return true
        // }while(startNode = traverse(startNode,absStep,type))
        // return false