Builtin = (function() {
    "use strict";
    var numericValueRegex = /^-?[0-9]+$/;

    function BinaryOp(computeFunction) {
        this.computeFunction = computeFunction;
        this.numArguments = 2;
    }
    BinaryOp.prototype.canApply = function(args) {
        return (args[0].hasOwnProperty('ident') && args[1].hasOwnProperty('ident') && numericValueRegex.test(args[0].ident.name) && numericValueRegex.test(args[0].ident.name));
    };
    BinaryOp.prototype.apply = function(args) {
        var a0 = parseInt(args[0].ident.name, 10);
        var a1 = parseInt(args[1].ident.name, 10);
        var ret = this.computeFunction(a0, a1);
        return new Expr.Ident(new Expr.Symbol('' + ret));
    };

    function IfOperator() {
        this.numArguments = 2;
    }
    IfOperator.prototype.canApply = function(args) {
        return (args[0].hasOwnProperty('ident') && (args[0].ident.name === 'true' || args[0].ident.name === 'false'));
    };
    IfOperator.prototype.apply = function(args) {
        if (args[0].ident.name === 'true') {
            return args[1];
        } else {
            return args[2];
        }
    };
    return {
        '+': new BinaryOp(function(a, b) {
            return a + b;
        }),
        '-': new BinaryOp(function(a, b) {
            return a - b;
        }),
        '*': new BinaryOp(function(a, b) {
            return a * b;
        }),
        '/': new BinaryOp(function(a, b) {
            return Math.floor(a / b);
        }),
        '=': new BinaryOp(function(a, b) {
            return a === b ? 'true' : 'false';
        }),
        '/=': new BinaryOp(function(a, b) {
            return a !== b ? 'true' : 'false';
        }),
        '<': new BinaryOp(function(a, b) {
            return a < b ? 'true' : 'false';
        }),
        '>': new BinaryOp(function(a, b) {
            return a < b ? 'true' : 'false';
        }),
        '<=': new BinaryOp(function(a, b) {
            return a <= b ? 'true' : 'false';
        }),
        '>=': new BinaryOp(function(a, b) {
            return a >= b ? 'true' : 'false';
        }),
        'if': new IfOperator()
    };
}());
Collections = (function() {
    "use strict";

    function Set() {
        this.data = {};
    }
    Set.prototype.contains = function(value) {
        var key = '' + value.hashCode;
        if (this.data.hasOwnProperty(key)) {
            var candidates = this.data[key];
            for (var i = candidates.length - 1; i >= 0; i--) {
                if (candidates[i].equals(value)) {
                    return true;
                }
            }
        }
        return false;
    };
    Set.prototype.add = function(value) {
        var key = '' + value.hashCode;
        if (this.data.hasOwnProperty(key)) {
            if (this.contains(value)) {
                return false;
            } else {
                this.data[key].push(value);
                return true;
            }
        } else {
            this.data[key] = [value];
            return true;
        }
    };
    Set.prototype.remove = function(value) {
        var key = '' + value.hashCode;
        if (this.data.hasOwnProperty(key)) {
            var candidates = this.data[key];
            for (var i = candidates.length - 1; i >= 0; i--) {
                if (candidates[i].equals(value)) {
                    if (candidates.length === 1) {
                        delete this.data[key];
                    } else {
                        candidates.splice(i, 1);
                    }
                    return true;
                }
            }
        }
        return false;
    };

    function Map() {
        this.data = {};
    }
    Map.prototype.get = function(key) {
        var hashCode = '' + key.hashCode;
        if (this.data.hasOwnProperty(hashCode)) {
            var candidates = this.data[hashCode];
            for (var i = candidates.length - 1; i >= 0; i--) {
                if (candidates[i].key.equals(key)) {
                    return candidates[i].value;
                }
            }
        }
        return null;
    };
    Map.prototype.put = function(key, value) {
        var hashCode = '' + key.hashCode;
        if (this.data.hasOwnProperty(hashCode)) {
            var candidates = this.data[hashCode];
            for (var i = candidates.length - 1; i >= 0; i--) {
                if (candidates[i].key.equals(key)) {
                    var old = candidates[i].value;
                    candidates[i].value = value;
                    return old;
                }
            }
            candidates.push({
                key: key,
                value: value
            });
            return null;
        } else {
            this.data[hashCode] = [{
                key: key,
                value: value
            }];
            return null;
        }
    };
    Map.prototype.remove = function(key, value) {
        var hashCode = '' + key.hashCode;
        if (this.data.hasOwnProperty(hashCode)) {
            var candidates = this.data[hashCode];
            for (var i = candidates.length - 1; i >= 0; i--) {
                if (candidates[i].key.equals(key)) {
                    var old = candidates[i].value;
                    candidates.splice(i, 1);
                    return old;
                }
            }
            return null;
        } else {
            return null;
        }
    };
    return {
        Set: Set,
        Map: Map
    };
}());
Expr = (function() {
    "use strict";
    var lastSymbolCodeAssigned = 0;
    var lastExprIdAssigned = 0;
    var Expr = function() {
        var myId = lastExprIdAssigned + 1;
        lastExprIdAssigned = myId;
        this.id = myId;
    };
    Expr.prototype.equals = function(other) {
        if (other === this) {
            return true;
        } else if (this.hashCode === other.hashCode) {
            return this.visit(new EqualityTester(), other);
        } else {
            return false;
        }
    };

    function HashCodeComputer() {
        this.map = new Collections.Map();
        this.lastIdent = 1;
    }
    HashCodeComputer.prototype.visitAbstract = function(e) {
        var ident = this.lastIdent;
        this.lastIdent = ident + 1;
        var oldId = this.map.put(e.sym, ident);
        var ret = e.expr.visit(this);
        if (oldId === null) {
            this.map.remove(e.sym);
        } else {
            this.map.put(e.sym, oldId);
        }
        return ret;
    };
    HashCodeComputer.prototype.visitApply = function(e) {
        var left = e.left.visit(this);
        var right = e.right.visit(this);
        var ret = (left << 5) - left + right;
        return ret & ret;
    };
    HashCodeComputer.prototype.visitIdent = function(e) {
        var ret = this.map.get(e.ident);
        if (ret === null) {
            return stringHashCode(e.ident.name);
        } else {
            return ret;
        }
    };

    function stringHashCode(name) {
        var hash = 0;
        for (var i = 0; i < name.length; i += 1) {
            hash = ((hash << 5) - hash) + name.charCodeAt(i);
            hash = hash & hash;
        }
        return hash;
    };

    function EqualityTester() {
        this.bound0 = new Collections.Map();
        this.bound1 = new Collections.Map();
        this.lastIdent = 0;
    }
    EqualityTester.prototype.visitAbstract = function(e0, e1) {
        if (e1.hasOwnProperty('sym')) {
            this.bound0.put(e0.sym, e1.sym);
            this.bound1.put(e1.sym, e0.sym);
            var ret = e0.expr.visit(this, e1.expr);
            this.bound0.remove(e0.sym);
            this.bound1.remove(e1.sym);
            return ret;
        } else {
            return false;
        }
    };
    EqualityTester.prototype.visitApply = function(e0, e1) {
        if (e1.hasOwnProperty('left')) {
            var ret = e0.left.visit(this, e1.left) && e0.right.visit(this, e1.right);
            return ret;
        } else {
            return false;
        }
    };
    EqualityTester.prototype.visitIdent = function(e0, e1) {
        if (e1.hasOwnProperty('ident')) {
            var want1 = this.bound0.get(e0.ident);
            var want0 = this.bound1.get(e1.ident);
            if (want1 === null && want0 === null) {
                var ret = e0.ident.name === e1.ident.name;
                return ret;
            } else {
                return e1.ident === want1;
            }
        } else {
            return false;
        }
    };
    Expr.Symbol = function(name) {
        var hashCode = lastSymbolCodeAssigned + 1;
        lastSymbolCodeAssigned = hashCode;
        this.hashCode = hashCode;
        this.name = name;
    };
    Expr.Symbol.prototype.equals = function(other) {
        return this === other;
    };
    Expr.Abstract = function(sym, expr) {
        Expr.call(this);
        this.sym = sym;
        this.expr = expr;
        this.hashCode = this.visit(new HashCodeComputer());
    };
    Expr.Abstract.prototype = new Expr();
    Expr.Abstract.prototype.constructor = Expr.Abstract;
    Expr.Abstract.prototype.addBounds = function(bounds, frees, curBounds) {
        var wasBounded = curBounds.hasOwnProperty(this.sym.hashCode);
        if (!wasBounded) {
            curBounds[this.sym.hashCode] = this.sym;
            bounds[this.sym.hashCode] = this.sym;
        }
        this.expr.addBounds(bounds, frees, curBounds);
        if (!wasBounded) {
            delete bounds[this.sym.hashCode];
        }
    };
    Expr.Abstract.prototype.visit = function(visitor, arg) {
        return visitor.visitAbstract(this, arg);
    };
    Expr.Abstract.prototype.size = function() {
        return 1 + this.expr.size();
    };
    Expr.Abstract.prototype.uses = function(sym) {
        return this.expr.uses(sym);
    };
    Expr.Apply = function(leftExpr, rightExpr) {
        Expr.call(this);
        this.left = leftExpr;
        this.right = rightExpr;
        var hash = leftExpr.hashCode;
        hash = (hash << 5) - hash + rightExpr.hashCode;
        this.hashCode = hash & hash;
    };
    Expr.Apply.prototype = new Expr();
    Expr.Apply.prototype.constructor = Expr.Apply;
    Expr.Apply.prototype.addBounds = function(bounds, frees, curBounds) {
        this.left.addBounds(bounds, frees, curBounds);
        this.right.addBounds(bounds, frees, curBounds);
    };
    Expr.Apply.prototype.visit = function(visitor, arg) {
        return visitor.visitApply(this, arg);
    };
    Expr.Apply.prototype.size = function() {
        return 1 + this.left.size() + this.right.size();
    };
    Expr.Apply.prototype.uses = function(sym) {
        return this.left.uses(sym) || this.right.uses(sym);
    };
    Expr.Ident = function(sym) {
        Expr.call(this);
        this.ident = sym;
        this.hashCode = stringHashCode(sym.name);
    };
    Expr.Ident.prototype = new Expr();
    Expr.Ident.prototype.constructor = Expr.Ident;
    Expr.Ident.prototype.addBounds = function(bounds, frees, curBounds) {
        if (!curBounds.hasOwnProperty(this.ident.hashCode)) {
            frees[this.ident.hashCode] = this.ident;
        }
    };
    Expr.Ident.prototype.visit = function(visitor, arg) {
        return visitor.visitIdent(this, arg);
    };
    Expr.Ident.prototype.size = function() {
        return 1;
    };
    Expr.Ident.prototype.uses = function(sym) {
        return this.ident === sym;
    };
    return Expr;
}());
ExprStr = (function() {
    "use strict";
    var ret = {};
    var MAX_INT = 9007199254740992;
    var PARENS_LEFT = "(([(({";
    var PARENS_RIGHT = "))]))}";
    var VAR_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    ret.toText = function(expr, options) {
        var visitor = new PrintVisitor(expr, options, true, false);
        expr.visit(visitor, false);
        return visitor.output;
    };
    ret.toTextSubstituteBelow = function(expr, options) {
        var visitor = new PrintVisitor(expr, options, false, false);
        expr.visit(visitor, false);
        return visitor.output;
    };
    ret.toHtml = function(expr, options) {
        var visitor = new PrintVisitor(expr, options, true, true);
        expr.visit(visitor, false);
        return visitor.output;
    };
    ret.toHtmlSubstituteBelow = function(expr, options) {
        var visitor = new PrintVisitor(expr, options, false, true);
        expr.visit(visitor, false);
        return visitor.output;
    };

    function identifyChurchNumeral(e) {
        var syms;
        var symz;
        var count;
        var esub;
        if (e.hasOwnProperty('expr') && e.expr.hasOwnProperty('expr')) {
            syms = e.sym;
            symz = e.expr.sym;
            esub = e.expr.expr;
            count = 0;
            while (esub.hasOwnProperty('left')) {
                if (esub.left.hasOwnProperty('ident') && esub.left.ident === syms) {
                    count++;
                    esub = esub.right;
                } else {
                    return null;
                }
            }
            if (esub.hasOwnProperty('ident') && esub.ident === symz) {
                return "" + count;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    function PrintVisitor(expr, options, substAtTop, toHtml) {
        var sym;
        this.substAtTop = substAtTop;
        this.toHtml = toHtml;
        this.context = options && options.substSymbols ? options.context : null;
        this.maxLength = options ? options.maxLength : MAX_INT;
        this.varyParens = options ? options.varyParens : false;
        this.convertChurch = options ? options.calcType === simplify.PURE_CHURCH : false;
        this.output = '';
        this.outputLength = 0;
        this.parenDepth = 0;
        this.parenCur = -1;
        this.bounds = {};
        this.frees = {};
        this.freeNames = {};
        this.identNames = {};
        this.symMap = {};
        this.exceeded = false;
        this.lastAlloc = -1;
        this.visited = false;
        expr.addBounds(this.bounds, this.frees, {});
        for (var symHash in this.frees) {
            if (this.frees.hasOwnProperty(symHash)) {
                sym = this.frees[symHash];
                this.freeNames[sym.name] = true;
                this.identNames[sym.name] = true;
            }
        }
        for (symHash in this.bounds) {
            if (this.bounds.hasOwnProperty(symHash)) {
                sym = this.bounds[symHash];
                this.identNames[sym.name] = true;
            }
        }
    }
    PrintVisitor.prototype.allocate = function() {
        var identNames = this.identNames;
        var lastAlloc = this.lastAlloc;
        while (lastAlloc >= 0 && !identNames.hasOwnProperty("i" + lastAlloc)) {
            --lastAlloc;
        }
        while (true) {
            ++lastAlloc;
            var name = "i" + lastAlloc;
            if (!identNames.hasOwnProperty(name)) {
                this.lastAlloc = lastAlloc;
                identNames[name] = true;
                return name;
            }
        }
    };
    PrintVisitor.prototype.getLeftParen = function() {
        ++(this.parenDepth);
        if (this.varyParens) {
            var newCur = this.parenCur + 1;
            if (newCur >= PARENS_LEFT.length) {
                newCur = 0;
            }
            this.parenCur = newCur;
            return PARENS_LEFT.charAt(newCur);
        } else {
            return '(';
        }
    };
    PrintVisitor.prototype.getRightParen = function() {
        --(this.parenDepth);
        if (this.varyParens) {
            var cur = this.parenCur;
            var ret = PARENS_RIGHT.charAt(cur);
            if (cur === 0) {
                this.parenCur = PARENS_RIGHT.length - 1;
            } else {
                this.parenCur = cur - 1;
            }
            return ret;
        } else {
            return ')';
        }
    };
    PrintVisitor.prototype.append = function(add, length, force) {
        var curOut = this.output;
        var curLen = this.outputLength;
        var addLen = length;
        if (typeof add === 'undefined') {
            throw new TypeError();
        }
        if (typeof addLen === 'undefined') {
            addLen = add.length;
        }
        if (this.exceeded) {
            return false;
        } else if (curLen + addLen + this.parenDepth + 5 <= this.maxLength) {
            this.output = curOut + add;
            this.outputLength = curLen + addLen;
            return true;
        } else {
            if (this.toHtml) {
                this.output = curOut + ' &hellip; ';
            } else {
                this.output = curOut + ' ... ';
            }
            this.outputLength = curLen + 5;
            this.exceeded = true;
            return false;
        }
    };
    PrintVisitor.prototype.checkForSubstitution = function(expr) {
        if (this.context !== null) {
            if (this.substAtTop || this.visited) {
                var s = this.context.invert(expr);
                if (s !== null) {
                    if (this.toHtml && VAR_RE.test(s)) {
                        this.append('<var>' + s + '</var>', s.length);
                    } else {
                        this.append(s, s.length);
                    }
                    return true;
                }
                if (this.convertChurch) {
                    s = identifyChurchNumeral(expr);
                    if (s !== null) {
                        this.append(s, s.length);
                        return true;
                    }
                }
            }
            this.visited = true;
        }
        return false;
    };
    PrintVisitor.prototype.visitAbstract = function(expr, parens) {
        if (this.exceeded || this.checkForSubstitution(expr)) {
            return;
        }
        var name = expr.sym.name;
        if (this.freeNames.hasOwnProperty(name)) {
            name = this.allocate();
            this.symMap[expr.sym.hashCode] = name;
        }
        this.freeNames[name] = true;
        this.identNames[name] = true;
        var added = false;
        if (parens) {
            added = this.append(this.getLeftParen(), 1);
        }
        if (this.toHtml && VAR_RE.test(name)) {
            this.append('&lambda;<var>' + name + '</var>.', name.length + 2);
        } else {
            this.append('\\' + name + '.', name.length + 2);
        }
        expr.expr.visit(this, false);
        if (parens) {
            var paren = this.getRightParen();
            if (added) this.output += paren;
        }
        delete this.freeNames[name];
        delete this.identNames[name];
        if (name !== expr.sym.name) {
            delete this.symMap[expr.sym.hashCode];
        }
    };
    PrintVisitor.prototype.visitApply = function(expr, parens) {
        if (this.exceeded || this.checkForSubstitution(expr)) {
            return;
        }
        expr.left.visit(this, true);
        this.append(' ', 1);
        if (expr.right instanceof Expr.Apply) {
            var added = this.append(this.getLeftParen(), 1);
            expr.right.visit(this, false);
            var paren = this.getRightParen();
            if (added) this.append(paren, 1, true);
        } else {
            expr.right.visit(this, true);
        }
    };
    PrintVisitor.prototype.visitIdent = function(expr, parens) {
        var name;
        if (this.exceeded || this.checkForSubstitution(expr)) {
            return;
        }
        if (this.symMap.hasOwnProperty(expr.ident.hashCode)) {
            name = this.symMap[expr.ident.hashCode];
        } else {
            name = expr.ident.name;
        }
        if (this.toHtml && VAR_RE.test(name)) {
            this.append('<var>' + name + '</var>', name.length);
        } else {
            this.append(name, name.length);
        }
    };
    return ret;
}());
Context = (function() {
    "use strict";

    function Substitutor(context) {
        this.context = context;
    }
    Substitutor.prototype.visitAbstract = function(e) {
        var map = this.context.map;
        var sym = e.sym;
        var symName = sym.name;
        var oldValue = null;
        if (map.hasOwnProperty(symName)) {
            oldValue = map[symName];
            delete map[symName];
        }
        var ret = new Expr.Abstract(sym, e.expr.visit(this));
        if (oldValue !== null) {
            map[symName] = oldValue;
        }
        return ret;
    };
    Substitutor.prototype.visitApply = function(e) {
        return new Expr.Apply(e.left.visit(this), e.right.visit(this));
    };
    Substitutor.prototype.visitIdent = function(e) {
        var map = this.context.map;
        if (map.hasOwnProperty(e.ident.name)) {
            return map[e.ident.name];
        } else {
            return e;
        }
    };

    function Context() {
        this.baseMap = {};
        this.map = {};
        this.inverse = new Collections.Map();
        this.substitutor = new Substitutor(this);
    }
    Context.prototype.substitute = function(e) {
        return e.visit(this.substitutor);
    };
    Context.prototype.contains = function(symName) {
        return this.map.hasOwnProperty(symName.trim());
    };
    Context.prototype.isEmpty = function() {
        var map = this.map;
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };
    Context.prototype.getKeys = function() {
        var map = this.map;
        var ret = [];
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                ret.push(key);
            }
        }
        ret.sort();
        return ret;
    };
    Context.prototype.put = function(symName, e, baseExpr) {
        var map = this.map;
        var inv = this.inverse;
        var name = symName.trim();
        var expr = e;
        var oldExpr = null;
        if (map.hasOwnProperty(name)) {
            oldExpr = map[name];
            inv.remove(oldExpr);
        }
        map[name] = expr;
        if (typeof baseExpr === 'undefined' || baseExpr === null) {
            if (this.baseMap.hasOwnProperty[name]) {
                delete this.baseMap[name];
            }
        } else {
            this.baseMap[name] = baseExpr;
        }
        inv.put(expr, name);
        return oldExpr;
    };
    Context.prototype.remove = function(symName) {
        var map = this.map;
        var inv = this.inverse;
        var name = symName.trim();
        var expr;
        if (this.baseMap.hasOwnProperty(name)) {
            delete this.baseMap[name];
        }
        if (map.hasOwnProperty(name)) {
            expr = map[name];
            delete map[name];
            inv.remove(expr);
            return true;
        } else {
            return false;
        }
    };
    Context.prototype.get = function(symName) {
        var map = this.map;
        var name = symName.trim();
        if (map.hasOwnProperty(name)) {
            return map[name];
        } else {
            return null;
        }
    };
    Context.prototype.getBase = function(symName) {
        var baseMap = this.baseMap;
        var name = symName.trim();
        if (baseMap.hasOwnProperty(name)) {
            return baseMap[name];
        } else {
            return null;
        }
    };
    Context.prototype.invert = function(e) {
        return this.inverse.get(e);
    };
    return Context;
}());
reduce = (function(Collections) {
    "use strict";
    var NUMBER_REGEX = /^(0|[1-9][0-9]*)$/;

    function ChurchConverter() {
        this.bounds = {};
    }
    ChurchConverter.prototype.visitAbstract = function(e) {
        var wasBound = this.bounds.hasOwnProperty(e.sym.name);
        this.bounds[e.sym.name] = true;
        var sub = e.expr.visit(this);
        if (!wasBound) {
            delete this.bounds[e.sym.name];
        }
        if (sub === e.expr) {
            return e;
        } else {
            return new Expr.Abstract(e.sym, sub);
        }
    };
    ChurchConverter.prototype.visitApply = function(e) {
        var sub0 = e.left.visit(this);
        var sub1 = e.right.visit(this);
        if (sub0 === e.left && sub1 === e.right) {
            return e;
        } else {
            return new Expr.Apply(sub0, sub1);
        }
    };
    ChurchConverter.prototype.visitIdent = function(e) {
        var name = e.ident.name;
        if (NUMBER_REGEX.test(name) && !this.bounds.hasOwnProperty(name)) {
            var s = new Expr.Ident(new Expr.Symbol('s'));
            var z = new Expr.Ident(new Expr.Symbol('z'));
            var cur = z;
            var toAdd = parseInt(name, 10);
            while (toAdd > 0) {
                cur = new Expr.Apply(s, cur);
                toAdd--;
            }
            return new Expr.Abstract(s.ident, new Expr.Abstract(z.ident, cur));
        } else {
            return e;
        }
    };

    function reduce(expr, options) {
        var steps = [];
        var curExpr = expr;
        if (options.context !== null) {
            curExpr = options.context.substitute(curExpr);
        }
        if (options.calcType === simplify.PURE_CHURCH) {
            curExpr = curExpr.visit(new ChurchConverter());
        }
        var original = curExpr;
        var smallest = curExpr;
        var smallestSize = curExpr.size();
        var nextExpr = simplify(curExpr, options);
        var histSet = new Collections.Set();
        var hist = new Array(100);
        var histPos = -1;
        var count = 0;
        while (curExpr !== nextExpr) {
            if (options.showIntermediate && curExpr !== original) {
                steps.push(curExpr);
            }
            curExpr = nextExpr;
            ++count;
            if (count > options.maxReductions || histSet.contains(curExpr)) {
                if (options.showIntermediate && curExpr !== smallest) {
                    steps.push(null);
                }
                curExpr = smallest;
                break;
            }
            ++histPos;
            if (histPos === hist.length) histPos = 0;
            if (typeof hist[histPos] !== 'undefined') {
                histSet.remove(hist[histPos]);
            }
            hist[histPos] = curExpr;
            histSet.add(curExpr);
            var exprSize = curExpr.size();
            if (exprSize < smallestSize) {
                smallest = curExpr;
                smallestSize = exprSize;
            }
            nextExpr = simplify(curExpr, options);
        }
        return {
            steps: steps,
            expr: curExpr
        };
    }
    return reduce;
}(Collections));
simplify = (function() {
    "use strict";
    var EAGER_EVALUATION = 0;
    var LAZY_EVALUATION = 1;
    var LAZY_SLOW_EVALUATION = 2;
    var APPLIED = 0;
    var PURE_CHURCH = 1;
    var PURE = 2;

    function CandidateFinder(options) {
        this.options = options;
    }
    CandidateFinder.prototype.visitAbstract = function(e) {
        if (this.canReduce(e)) return e;
        else return e.expr.visit(this);
    };
    CandidateFinder.prototype.visitIdent = function(e) {
        if (this.canReduce(e)) return e;
        else return null;
    };
    CandidateFinder.prototype.canReduce = function(e) {
        if (e.hasOwnProperty('left') && e.left.hasOwnProperty('expr')) {
            return true;
        }
        if (this.options.useEtas && e.hasOwnProperty('expr') && e.expr.hasOwnProperty('left') && e.expr.right.hasOwnProperty('ident') && e.expr.right.ident === e.sym && !e.expr.left.uses(e.sym)) {
            return true;
        }
        if (this.options.calcType === APPLIED) {
            var funcExpr = e;
            var argCount = 0;
            while (funcExpr.hasOwnProperty('left')) {
                funcExpr = funcExpr.left;
                argCount++;
            }
            if (funcExpr.hasOwnProperty('ident') && Builtin.hasOwnProperty(funcExpr.ident.name)) {
                var builtin = Builtin[funcExpr.ident.name];
                if (builtin.numArguments === argCount) {
                    var args = this.getArguments(e, argCount);
                    if (builtin.canApply(args)) return true;
                }
            }
        }
        return false;
    };
    CandidateFinder.prototype.reduce = function(e) {
        if (e.hasOwnProperty('left') && e.left.hasOwnProperty('expr')) {
            return e.left.expr.visit(new SymbolSubstitutor(e.left.sym, e.right));
        }
        if (this.options.useEtas && e.hasOwnProperty('expr') && e.expr.hasOwnProperty('left')) {
            return e.expr.left;
        }
        if (this.options.calcType === APPLIED) {
            var funcExpr = e;
            var argCount = 0;
            while (funcExpr.hasOwnProperty('left')) {
                funcExpr = funcExpr.left;
                argCount++;
            }
            if (funcExpr.hasOwnProperty('ident') && Builtin.hasOwnProperty(funcExpr.ident.name)) {
                var builtin = Builtin[funcExpr.ident.name];
                if (builtin.numArguments === argCount) {
                    var args = this.getArguments(e, argCount);
                    return builtin.apply(args);
                }
            }
        }
        return null;
    };
    CandidateFinder.prototype.getArguments = function(expr, argCount) {
        var argExpr = expr;
        var args = new Array(argCount);
        var argPos = argCount - 1;
        while (argExpr.hasOwnProperty('left')) {
            args[argPos] = argExpr.right;
            argPos--;
            argExpr = argExpr.left;
        }
        return args;
    };

    function LazyCandidateFinder(options) {
        this.options = options;
    }
    LazyCandidateFinder.prototype = new CandidateFinder();
    LazyCandidateFinder.prototype.constructor = LazyCandidateFinder;
    LazyCandidateFinder.prototype.visitApply = function(expr) {
        if (this.canReduce(expr)) return expr;
        var ret = expr.left.visit(this);
        if (ret !== null) return ret;
        return expr.right.visit(this);
    };

    function EagerCandidateFinder(options) {
        this.options = options;
    }
    EagerCandidateFinder.prototype = new CandidateFinder();
    EagerCandidateFinder.prototype.constructor = EagerCandidateFinder;
    EagerCandidateFinder.prototype.visitApply = function(expr) {
        var ret = expr.right.visit(this);
        if (ret !== null) return ret;
        if (this.canReduce(expr)) return expr;
        return expr.left.visit(this);
    };

    function SymbolSubstitutor(symbolToFind, exprToReplace) {
        this.toFind = symbolToFind;
        this.toReplace = exprToReplace;
    }
    SymbolSubstitutor.prototype.visitAbstract = function(e) {
        if (e.sym === this.toFind) return e;
        var expr = e.expr.visit(this);
        if (expr === e.expr) return e;
        else return new Expr.Abstract(e.sym, expr);
    };
    SymbolSubstitutor.prototype.visitApply = function(e) {
        var left = e.left.visit(this);
        var right = e.right.visit(this);
        if (left === e.left && right === e.right) return e;
        else return new Expr.Apply(left, right);
    };
    SymbolSubstitutor.prototype.visitIdent = function(e) {
        return e.ident === this.toFind ? this.toReplace : e;
    };

    function LazySubstitutor(exprSource, exprDest) {
        this.creations = new Collections.Map();
        this.source = exprSource;
        this.dest = exprDest;
    }
    LazySubstitutor.prototype.visitAbstract = function(e) {
        if (e === this.source) return this.dest;
        var expr = e.expr.visit(this);
        if (expr === e.expr) {
            return e;
        } else {
            var ret = this.creations.get(e);
            if (ret === null) {
                ret = new Expr.Abstract(e.sym, expr);
                this.creations.put(e, ret);
            }
            return ret;
        }
    };
    LazySubstitutor.prototype.visitApply = function(e) {
        if (e === this.source) return this.dest;
        var left = e.left.visit(this);
        var right = e.right.visit(this);
        if (left === e.left && right === e.right) {
            return e;
        } else {
            var ret = this.creations.get(e);
            if (ret === null) {
                ret = new Expr.Apply(left, right);
                this.creations.put(e, ret);
            }
            return ret;
        }
    };
    LazySubstitutor.prototype.visitIdent = function(e) {
        return e === this.source ? this.dest : e;
    };

    function EagerSubstitutor(exprSource, exprDest) {
        this.source = exprSource;
        this.dest = exprDest;
    }
    EagerSubstitutor.prototype.visitAbstract = function(e) {
        if (e === this.source) return this.dest;
        var expr = e.expr.visit(this);
        return expr === e.expr ? e : new Expr.Abstract(e.sym, expr);
    };
    EagerSubstitutor.prototype.visitApply = function(e) {
        if (e === this.source) return this.dest;
        var right = e.right.visit(this);
        if (right !== e.right) return new Expr.Apply(e.left, right);
        var left = e.left.visit(this);
        if (left !== e.left) return new Expr.Apply(left, e.right);
        return e;
    };
    EagerSubstitutor.prototype.visitIdent = function(e) {
        return e === this.source ? this.dest : e;
    };

    function LazySlowSubstitutor(exprSource, exprDest) {
        this.source = exprSource;
        this.dest = exprDest;
    }
    LazySlowSubstitutor.prototype.visitAbstract = function(e) {
        if (e === this.source) return this.dest;
        var expr = e.expr.visit(this);
        return expr === e.expr ? e : new Expr.Abstract(e.sym, expr);
    };
    LazySlowSubstitutor.prototype.visitApply = function(e) {
        if (e === this.source) return this.dest;
        var left = e.left.visit(this);
        if (left !== e.left) return new Expr.Apply(left, e.right);
        var right = e.right.visit(this);
        if (right !== e.right) return new Expr.Apply(e.left, right);
        return e;
    };
    LazySlowSubstitutor.prototype.visitIdent = function(e) {
        return e === this.source ? this.dest : e;
    };
    var simplify = function(original, options) {
        var candFinder;
        var substClass;
        if (options.evalOrder === EAGER_EVALUATION) {
            candFinder = new EagerCandidateFinder(options);
            substClass = EagerSubstitutor;
        } else if (options.evalOrder === LAZY_SLOW_EVALUATION) {
            candFinder = new LazyCandidateFinder(options);
            substClass = LazySlowSubstitutor;
        } else {
            candFinder = new LazyCandidateFinder(options);
            substClass = LazySubstitutor;
        }
        var source = original.visit(candFinder);
        if (source === null) return original;
        var dest = candFinder.reduce(source);
        return original.visit(new substClass(source, dest));
    };
    simplify.EAGER_EVALUATION = EAGER_EVALUATION;
    simplify.LAZY_EVALUATION = LAZY_EVALUATION;
    simplify.LAZY_SLOW_EVALUATION = LAZY_SLOW_EVALUATION;
    simplify.APPLIED = 0;
    simplify.PURE_CHURCH = PURE_CHURCH;
    simplify.PURE = PURE;
    return simplify;
}());
parse = (function() {
    "use strict";
    var LAMBDA = 0;
    var LPAREN = 1;
    var RPAREN = 2;
    var LBRACKET = 3;
    var RBRACKET = 4;
    var LBRACE = 5;
    var RBRACE = 6;
    var DOT = 7;
    var ID = 8;
    var EOF = 9;

    function Scanner(source) {
        this.source = source;
        this.pos = 0;
        this.next = 0;
        this.cur = 0;
        this.data = '';
        this.chomp();
    }
    var scanner_dict = {
        '\\': LAMBDA,
        '(': LPAREN,
        ')': RPAREN,
        '[': LBRACKET,
        ']': RBRACKET,
        '{': LBRACE,
        '}': RBRACE,
        '.': DOT
    };
    Scanner.prototype.chomp = function() {
        var source = this.source;
        var len = source.length;
        var i = this.next;
        var c;
        do {
            if (i === len) {
                this.cur = EOF;
                this.data = '$';
                this.pos = i;
                this.next = len;
                return;
            }
            c = source.charAt(i);
            i++;
        } while (c === ' ');
        this.pos = i - 1;
        if (scanner_dict.hasOwnProperty(c)) {
            this.cur = scanner_dict[c];
            this.data = c;
            this.next = i;
        } else {
            while (i < len && " \\()[]{}.".indexOf(source.charAt(i)) < 0) {
                i++;
            }
            this.cur = ID;
            this.data = source.substring(this.pos, i);
            this.next = i;
        }
    };
    Scanner.prototype.newError = function(msg) {
        return {
            isError: true,
            message: this.pos + ': ' + msg
        };
    };

    function isError(obj) {
        return obj.hasOwnProperty('isError') && obj.isError;
    }
    var parseFactorAction = {};

    function expectingClose(closeToken, closeText) {
        return function(scan, syms) {
            scan.chomp();
            var ret = parseExpr(scan, syms);
            if (isError(ret)) {
                return ret;
            } else if (scan.cur !== closeToken) {
                return scan.newError(scan, "Expected '" + closeText + "'");
            } else {
                scan.chomp();
                return ret;
            }
        };
    }
    parseFactorAction['' + LPAREN] = expectingClose(RPAREN, ')');
    parseFactorAction['' + LBRACKET] = expectingClose(RBRACKET, ']');
    parseFactorAction['' + LBRACE] = expectingClose(RBRACE, '}');
    parseFactorAction['' + ID] = function(scan, syms) {
        var sym;
        if (syms.hasOwnProperty(scan.data)) {
            sym = syms[scan.data];
        } else {
            sym = new Expr.Symbol(scan.data);
            syms[sym.name] = sym;
        }
        scan.chomp();
        return new Expr.Ident(sym);
    };
    parseFactorAction['' + LAMBDA] = function(scan, syms) {
        scan.chomp();
        if (scan.cur !== ID) {
            return scan.newError("Parameter name missing following lambda");
        }
        var name = scan.data;
        var oldSym = syms[name];
        var newSym = new Expr.Symbol(name);
        syms[name] = newSym;
        scan.chomp();
        if (scan.cur !== DOT) {
            return scan.newError("Period missing following parameter name");
        }
        scan.chomp();
        var expr = parseExpr(scan, syms);
        if (isError(expr)) {
            return expr;
        } else {
            if (typeof oldSym === 'undefined') {
                delete syms[name];
            } else {
                syms[name] = oldSym;
            }
            return new Expr.Abstract(newSym, expr);
        }
    };

    function parseFactor(scan, syms) {
        var key = '' + scan.cur;
        if (parseFactorAction.hasOwnProperty(key)) {
            return parseFactorAction[key](scan, syms);
        } else {
            return scan.newError("Unexpected token");
        }
    }

    function parseExpr(scan, syms) {
        var ret = parseFactor(scan, syms);
        if (isError(ret)) {
            return ret;
        }
        while (scan.cur !== EOF && scan.cur !== RPAREN && scan.cur !== RBRACKET && scan.cur !== RBRACE) {
            var next = parseFactor(scan, syms);
            if (isError(next)) {
                return next;
            }
            ret = new Expr.Apply(ret, next);
        }
        return ret;
    }
    return function(source) {
        var scan = new Scanner(source);
        var syms = {};
        var ret = parseExpr(scan, syms);
        if (isError(ret)) {
            return {
                ok: false,
                error: ret.message
            };
        } else if (scan.cur !== EOF) {
            return {
                ok: false,
                error: scan.newError("Could not parse all of expression").message
            };
        } else {
            return {
                ok: true,
                expr: ret
            };
        }
    };
}());
options = (function($) {
    "use strict";
    var options = {
        context: new Context()
    };

    function BooleanOption(varName, eltName, defaultValue) {
        this.varName = varName;
        this.eltName = eltName;
        options[this.varName] = defaultValue;
    }
    BooleanOption.prototype.eltFromValue = function() {
        var elt = $('#' + this.eltName);
        if (options[this.varName]) {
            elt.attr('checked', 'checked');
        } else {
            elt.removeAttr('checked');
        }
    };
    BooleanOption.prototype.valueFromElt = function() {
        options[this.varName] = $('#' + this.eltName).is(':checked');
    };

    function ComboOption(varName, eltName, defaultValue, optionNames, optionValues) {
        this.varName = varName;
        this.eltName = eltName;
        options[this.varName] = defaultValue;
        this.optionNames = optionNames;
        this.optionValues = optionValues;
    }
    ComboOption.prototype.eltFromValue = function() {
        var val = options[this.varName];
        var vals = this.optionValues;
        var elt = $('#' + this.eltName);
        elt.empty();
        $.each(this.optionNames, function(i, text) {
            var opt = $('<option></option>').attr('value', '' + i).text(text);
            if (vals[i] === val) {
                opt.attr('selected', 'selected');
            }
            elt.append(opt);
        });
    };
    ComboOption.prototype.valueFromElt = function() {
        var val = parseInt($('#' + this.eltName).val(), 10);
        if (val >= 0 && val < this.optionValues.length) {
            options[this.varName] = this.optionValues[val];
        }
    };
    var optionManagers = [new BooleanOption('useEtas', 'useEtasCheck', true), new BooleanOption('substSymbols', 'substSymbolsCheck', true), new BooleanOption('showIntermediate', 'showIntermediateCheck', true), new BooleanOption('varyParens', 'varyParensCheck', true), new ComboOption('evalOrder', 'evalOrderCombo', simplify.LAZY_EVALUATION, ['Lazy Evaluation', 'Eager Evaluation', 'Normal Evaluation'], [simplify.LAZY_EVALUATION, simplify.EAGER_EVALUATION, simplify.LAZY_SLOW_EVALUATION]), new ComboOption('calcType', 'calcTypeCombo', simplify.APPLIED, ['Applied Calculus', 'Pure Calculus With Numerals', 'Pure Calculus Without Numerals'], [simplify.APPLIED, simplify.PURE_CHURCH, simplify.PURE]), new ComboOption('maxReductions', 'maxReductionsCombo', 200, ['25', '50', '100', '200', '500', '1000', '2000'], [25, 50, 100, 200, 500, 1000, 2000]), new ComboOption('maxLength', 'maxLengthCombo', 200, ['25', '50', '100', '200', '500', '1000', '2000'], [25, 50, 100, 200, 500, 1000, 2000])];
    options.updatePage = function() {
        $.each(optionManagers, function(i, option) {
            option.eltFromValue();
        });
    };
    options.loadFromPage = function() {
        $.each(optionManagers, function(i, option) {
            option.valueFromElt();
        });
    };
    return options;
}(jQuery));
var dictionary = (function($) {
    "use strict";
    var dictionary = {};
    dictionary.updatePage = function() {
        var dict = options.context;
        var keys = dict.getKeys();
        var table = $('#dictionary');
        $('#dictionaryText').hide();
        $('#dictionaryShow button').text("Show Text");
        table.empty();
        if (keys.length === 0) {
            table.append($('<tr><td>Dictionary is empty.</td></tr>'));
        } else {
            $.each(keys, function(i, key) {
                var expr = dict.get(key);
                var tr = $('<tr></tr>');
                tr.append($('<td></td>').html(ExprStr.toHtml(parse(key).expr, options)));
                tr.append($('<td>=</td>'));
                tr.append($('<td></td>').addClass('defn').html(ExprStr.toHtmlSubstituteBelow(expr, options)));
                tr.append($('<td></td>').addClass('defndel'));
                $('td', tr).slice(0, 3).click(defnClickHandler(key));
                table.append(tr);
            });
        }
    };

    function defnClickHandler(id) {
        return function(e) {
            e.preventDefault();
            var tr = $(this).closest('tr');
            var td = $('.defndel', tr);
            if ($('form', td).size() === 0) {
                td.append($('<form></form>').submit(defnDeleter(id)).append($('<button class="imgbutton" type="submit"></button>').append($('<img src="img/clear.png"></img>'))));
            } else {
                td.empty();
            }
        };
    }

    function defnDeleter(id) {
        return function(e) {
            e.preventDefault();
            var tr = $(this).closest('tr');
            if (options.context.remove(id)) {
                tr.remove();
                $('#dictionaryText').hide();
                var table = $('#dictionary');
                if ($('tr', table).size() === 0) {
                    table.append($('<tr><td>Dictionary is empty.</td></tr>'));
                }
            }
        };
    }
    dictionary.showText = function(e) {
        e.preventDefault();
        var dest = $('#dictionaryText');
        if (dest.css('display') !== 'none') {
            dest.hide();
            $('#dictionaryShow button').text("Show Text");
        } else {
            var allText = '';
            var dict = options.context;
            var keys = dict.getKeys();
            $.each(keys, function(i, key) {
                if (i > 0) {
                    allText += '\n';
                }
                var s = ExprStr.toTextSubstituteBelow(dict.get(key), options);
                var line;
                line = key;
                var baseExpr = dict.getBase(key);
                if (baseExpr !== null) {
                    line += ' [' + baseExpr + ']';
                }
                line += ' = ' + s;
                allText += line;
            });
            dest.val(allText).show().focus().select();
            $('#dictionaryShow button').text("Hide Text");
        }
    };
    dictionary.add = function(id, exprStr) {
        var parseResult = parse(exprStr, options);
        if (parseResult.ok) {
            var reduceResult = reduce(parseResult.expr, options);
            options.context.put(id, reduceResult.expr, null);
        }
    };
    return dictionary;
}(jQuery));
docs = (function($) {
    "use strict";

    function showSectionHandler(secName) {
        return function(e) {
            var link = $('#doc' + secName + 'Item');
            var section = $('#doc' + secName + 'Sec');
            e.preventDefault();
            if (section.css('display') === 'none') {
                $('.docSection:not(#doc' + secName + 'Sec)').fadeOut(50);
                section.fadeIn(50);
                $('.docContents a:not(#doc' + secName + 'Item)').removeClass('docItemSelected');
                link.addClass('docItemSelected');
            }
        };
    }

    function initItem(secName, selected) {
        var link = $('#doc' + secName + 'Item');
        var section = $('#doc' + secName + 'Sec');
        link.click(showSectionHandler(secName));
        if (selected) {
            link.addClass("docItemSelected");
            section.show();
        } else {
            link.removeClass("docItemSelected");
            section.hide();
        }
    }
    var docs = {};
    docs.init = function() {
        initItem("About", true);
        initItem("Background", false);
        initItem("Basics", false);
        initItem("Dictionary", false);
        initItem("Options", false);
    };
    return docs;
}(jQuery));
(function($) {
    "use strict";
    var curBase = null;
    var curExpr = null;

    function reduceRequested(e) {
        e.preventDefault();
        var reduceInput = $('#reduceForm input');
        var exprStr = reduceInput.val().trim();
        if (exprStr === '') {
            $('#reduction').empty();
            return;
        }
        var parseResult = parse(exprStr);
        var destination = $('#reduction');
        if (parseResult.ok) {
            var reduceResult = reduce(parseResult.expr, options);
            var row0 = ExprStr.toHtmlSubstituteBelow(parseResult.expr, options);
            var row1;
            if (parseResult.expr.hasOwnProperty('ident')) {
                row1 = ExprStr.toHtmlSubstituteBelow(reduceResult.expr, options);
            } else {
                row1 = ExprStr.toHtml(reduceResult.expr, options);
            }
            var table = $('<table id="answer2"></table>');
            table.append($('<tr></tr>').append($('<td></td>').attr('colspan', 2).html(row0)));
            if (reduceResult.steps.length === 1) {
                var rowi = ExprStr.toHtml(reduceResult.steps[0], options);
                table.append($('<tr></tr>').append($('<td>&rArr;</td>')).append($('<td></td>').html(rowi)));
            } else if (reduceResult.steps.length > 1) {
                var showText = 'Show ' + reduceResult.steps.length + ' Intermediate Steps';
                var showForm = $('<form id="showform"></form').append($('<button id="fku" type="submit"></button>').text(showText));
                showForm.submit(showIntermediateHandler(reduceResult.steps));
                table.append($('<tr></tr>').append($('<td>&hellip;</td>')).append($('<td></td>').append(showForm)));
            }
            table.append($('<tr></tr>').append($('<td>&rArr;</td>')).append($('<td></td>').html(row1)));
            $('#reduction').empty().append(table);
            curBase = exprStr.trim();
            curExpr = reduceResult.expr;
            $('#addFeedback').empty();
            $('#addForm').show();
            $('#fku').click();
        } else {
            $('#reduction').empty().text('' + parseResult.error);
            curBase = null;
            curExpr = null;
            $('#addForm').hide();
            $('#addFeedback').empty();
        }
        reduceInput.focus().select();
    }

    function showIntermediateHandler(steps) {
        return function(e) {
            e.preventDefault();
            var base = $(this).closest('tr');
            $.each(steps, function(i, expr) {
                var text = expr === null ? '&hellip;' : ExprStr.toHtml(expr, options);
                base.before($('<tr></tr>').append($('<td></td>').html('&rArr;')).append($('<td></td>').html(text)));
            });
            base.remove();
        };
    }

    function addFocused(e) {
        $('#addFeedback').empty();
    }

    function addRequested(e) {
        e.preventDefault();
        var input = $('#addForm input');
        if (input.size() !== 1) {
            console.log('ID input not identified');
        } else {
            var id = input.val();
            var expr = curExpr;
            if (id === '') {
                $('#addFeedback').text('Enter symbol name at left.')
                input.focus().select();
            } else if (expr === null) {
                $('#addFeedback').text('Value not specified.');
                input.focus().select();
            } else {
                var oldExpr = options.context.put(id, expr, curBase);
                input.val('');
                $('#reduceForm input').focus();
                if (oldExpr === null) {
                    $('#addFeedback').text('Added.');
                } else {
                    $('#addFeedback').text('Replaced.');
                }
                $('#reduceForm input').focus().select();
            }
        }
    }

    function dlogOpen(dlogDiv) {
        $('#overlay').fadeIn(100);
        dlogDiv.fadeIn(50);
    }

    function dlogClose(dlogDiv) {
        dlogDiv.fadeOut(50);
        $('#overlay').fadeOut(100);
    }

    function dictionaryOpen(e) {
        e.preventDefault();
        dictionary.updatePage();
        dlogOpen($('#dictionaryDlog'));
    }

    function dictionaryClose(e) {
        e.preventDefault();
        dlogClose($('#dictionaryDlog'));
    }

    function optionsOpen(e) {
        e.preventDefault();
        options.updatePage();
        dlogOpen($('#optionsDlog'));
    }

    function optionsClose(e) {
        e.preventDefault();
        options.loadFromPage();
        dlogClose($('#optionsDlog'));
    }

    function docOpen(e) {
        e.preventDefault();
        dlogOpen($('#docDlog'));
        docs.init();
    }

    function docClose(e) {
        e.preventDefault();
        dlogClose($('#docDlog'));
    }
    $(document).ready(function() {
        $('#reduceForm').submit(reduceRequested);
        $('#addForm input').focus(addFocused);
        $('#addForm').submit(addRequested);
        $('#addForm').hide();
        $('#overlay').hide();
        $('#dictionaryDlog').hide();
        $('#dictionaryIcon').click(dictionaryOpen);
        $('#dictionaryForm').submit(dictionaryClose);
        $('#dictionaryShow').submit(dictionary.showText);
        $('#optionsDlog').hide();
        $('#optionsIcon').click(optionsOpen);
        $('#optionsForm').submit(optionsClose);
        $('#docDlog').hide();
        $('#docIcon').click(docOpen);
        $('#docForm').submit(docClose);
    });
}(jQuery));