var __nodeCounter__ = 0;

function Lit(value)
{
  this._value = value;
}

Lit.prototype.equals =
  function (x)
  {
    return x === this;
  }

Lit.prototype.hashCode =
  function ()
  {
    return HashCode.hashCode(this._value);
  }

Lit.prototype.value =
  function ()
  {
    return this._value;
  }

Lit.prototype.toString =
  function ()
  {
    return String(this._value);
  }

function Null()
{
}

Null.prototype.equals =
  function (x)
  {
    return x === this;
  }

Null.prototype.hashCode =
  function ()
  {
    return 11;
  }

Null.prototype.toString =
  function ()
  {
    return "()";
  }

Null.prototype.valueOf = 
  function ()
  {
    return Null;
  }

function Sym(name)
{
  this.name = name;
}

Sym.prototype.equals =
  function (x)
  {
    return x === this;
  }

Sym.prototype.hashCode =
  function ()
  {
    return this.name.hashCode();
  }

Sym.prototype.toString =
  function ()
  {
    return this.name;
  }

function Pair(car, cdr)
{
  assertFalse(car == null);
  assertFalse(cdr == null);
  this.car = car;
  this.cdr = cdr;
}

Pair.toList =
  function (arr)
  {
    var l = new Null();
    for (var i = arr.length - 1; i > -1; i--)
    {
      l = new Pair(arr[i], l);
    }
    return l;  
  }

Pair.prototype.equals =
  function (x)
  {
    return x === this;
  }

Pair.prototype.hashCode =
  function ()
  {
    var prime = 41;
    var result = 1;
    result = prime * result + this.car.hashCode();
    result = prime * result + this.cdr.hashCode();
    return result;    
  }

Pair.prototype.toString =
  function ()
  {
    var ags = HashMap.empty();
    return this.toStringInternal(ags);
  }

Pair.prototype.toStringInternal =
  function (ags)
  {
    var sb = "(";
    ags = ags.put(this, ags.size());
    var p = this;
    do
    {
      var car = p.car;
      if (car instanceof Pair)
      {
        var result = ags.get(car);
        if (result === undefined)
        {
          sb += car.toStringInternal(ags);
        }
        else
        {
          sb += "*" + result + "*";
        }
      }
      else
      {
        sb += String(car);
      }
      var cdr = p.cdr;
      if (cdr instanceof Pair)
      {
        var result = ags.get(cdr);
        if (result === undefined)
        {
          p = cdr;
          ags = ags.put(p, ags.size());
          sb += " ";
          continue;
        }
        else
        {
          sb += " . §" + result + "§";
          break;
        }
      }
      else if (cdr instanceof Null)
      {
        break;
      }
      else
      {
        sb += " . " + cdr;
        break;
      }
    }
    while (true);
    sb += ")";
    return sb;
  }

Pair.prototype.properToArray =
  function ()
  {
    var arr = [];
    var p = this;
    while (!(p instanceof Null))
    {
      arr.push(p.car);
      p = p.cdr;
    }
    return arr;
  }

function freeVariables(node)
{
  function fv(node, env)
  {
    if (node instanceof Lit)
    {
      return [];
    }
    if (node instanceof Sym)
    {
      return env.contains(node.name) ? [] : [node.name];
    }
    if (node instanceof Pair)
    {
      var car = node.car;
      if (car instanceof Sym)
      {
        var name = car.name;
        if (name === "lambda")
        {
          var params = node.cdr.car;
          var env2 = env;
          while (!(params instanceof Null))
          {
            var param = params.car;
            env2 = env2.add(param.name);
            params = params.cdr;
          }
          var body = node.cdr.cdr.car;
          return fv(body, env2);
        }
        if (name === "let")
        {
          var param = node.cdr.car.car.car;
          var exp =  node.cdr.car.car.cdr.car;
          var body = node.cdr.cdr.car;
          var env2 = env.add(param.name);
          return fv(exp, env).concat(fv(body, env2));
        }
        if (name === "letrec")
        {
          var param = node.cdr.car.car.car;
          var exp =  node.cdr.car.car.cdr.car;
          var body = node.cdr.cdr.car;
          var env2 = env.add(param.name);
          return fv(exp, env2).concat(fv(body, env2));
        }
        if (name === "if")
        {
          var cond = node.cdr.car;
          var cons = node.cdr.cdr.car;
          var alt = node.cdr.cdr.cdr.car;
          return fv(cond, env).concat(fv(cons, env)).concat(fv(alt, env));
        }
  //        if (name === "begin")
  //        {
  //          return evalBegin(node, benv, store, kont);
  //        }
        if (name === "set!")
        {
          var name = node.cdr.car.name;
          var exp = node.cdr.cdr.car;
          return fv(exp, env).concat([name]);
        }
        if (name === "quote")
        {
          return [];
        }
        if (name === "and" || name === "or")
        {
          var exp1 = node.cdr.car;
          var exp2 = node.cdr.cdr.car;
          return fv(exp1, env).concat(fv(exp2, env));
        }
      }
      var exps = node;
      var free = [];
      while (!(exps instanceof Null))
      {
        var exp = exps.car;
        free = free.concat(fv(exp, env));
        exps = exps.cdr;
      }
      return free;
    }
    throw new Error("cannot handle node " + node); 
  }
  
  return fv(node, ArraySet.empty());
}

function SchemeReader(str)
{
  this.str = str;
  this.pos = -1;
  this.line = 0;
  this.linePos = -1;
}

SchemeReader.prototype.peek =
  function ()
  {
    if (this.pos === this.str.length)
    {
      return null;
    }
    var r = this.str.charAt(this.pos + 1);
    return r;
  }

SchemeReader.prototype.read =
  function ()
  {
    if (this.pos === this.str.length)
    {
      return null;
    }
    var r = this.str.charAt(++this.pos);
    if (r === "\n")
    {
      this.line++;
      this.linePos = -1;
    }
    else
    {
      this.linePos++;
    }
    return r;
  }

function SchemeParser()
{
}

SchemeParser.isSyntacticKeyword =
  function (name)
  {
    return name === "lambda"
      || name === "define"
      || name === "let"
      || name === "let*"
      || name === "letrec"
      || name === "if"
      || name === "quote"
      || name === "begin"
  }

SchemeParser.prototype.parse =
  function (str)
  {
    var tokenizer = new SchemeTokenizer(str);
    var datas = [];
    var data;
    while ((data = tokenizer.next()) !== null)
    {
      datas.push(data);
    }
    return datas;
  }

function SchemeTokenizer(str)
{
  this.reader = new SchemeReader(str);
}

SchemeTokenizer.prototype.next =
  function ()
  {
    var c = this.skipWhitespace();
    return this.parse(c);
  }

SchemeTokenizer.prototype.parse =
  function (c)
  {
    switch (c)
    {
      case "(" : return this.parseList();
      case "'" : return this.parseQuote();
      case "\"" : return this.parseString();
      case "#" : 
      {
        var d = this.reader.read();
        if (d === "t")
        {
          var po = new Lit(true);
          po.tag = ++__nodeCounter__;
          po.sp = {pos:this.reader.pos - 1, line:this.reader.line, linePos:this.reader.linePos - 1, length:2};
          return po;
        }
        else if (d === "f")
        {
          var po = new Lit(false);
          po.tag = ++__nodeCounter__;
          po.sp = {pos:this.reader.pos - 1, line:this.reader.line, linePos:this.reader.linePos - 1, length:2};
          return po;
        }
        else if (d === "(")
        {
          return this.parseVector();
        }
        throw new Error("illegal syntax: #" + d);
      }
      case "-" :
      {
        var d = this.reader.peek(); // peek?
        if (Character.isWhitespace(d) || d === ")" || d === "")
        {
          var po = new Sym("-");
          po.tag = ++__nodeCounter__;
          po.sp = {pos:this.reader.pos, line:this.reader.line, linePos:this.reader.linePos, length:1};
          return po;
        }
        return this.parseNumber(c); 
      }
      case "" : return null;
    }
    if (Character.isDigit(c))
    {
      return this.parseNumber(c);
    }
    return this.parseIdentifier(c);
  }

SchemeTokenizer.prototype.parseIdentifier =
  function (c)
  {
    var sp = {pos:this.reader.pos, line:this.reader.line, linePos:this.reader.linePos};
    var identifier = c;
    while (!Character.isWhitespace(c = this.reader.peek()) && c !== ")" && c !== "")
    {
      identifier += this.reader.read();
    }
    var po = new Sym(identifier);
    po.tag = ++__nodeCounter__;
    sp.length = identifier.length;
    po.sp = sp;
    return po;
  }

SchemeTokenizer.prototype.parseQuote =
  function ()
  {
    var sp = {pos:this.reader.pos, line:this.reader.line, linePos:this.reader.linePos};
    var c = this.reader.read();
    var e = this.parse(c);
    var sym = new Sym("quote");
    sym.tag = ++__nodeCounter__;
    var nll = new Null();
    nll.tag = ++__nodeCounter__;
    var pair = new Pair(e, nll);
    pair.tag = ++__nodeCounter__;
    var po = new Pair(sym, pair);
    po.tag = ++__nodeCounter__;
    sp.length = this.reader.pos - sp.pos;
    po.sp = sp;
    return po;
  }

SchemeTokenizer.prototype.parseString =
  function ()
  {
    var sp = {pos:this.reader.pos, line:this.reader.line, linePos:this.reader.linePos};
    var s = "";
    var c;
    while ((c = this.reader.read()) !== "\"")
    {
      if (c === "")
      {
        throw new Error("unmatched \"");
      }
      if (c === "\\")
      {
        c = this.reader.read();
      }
      s += c;
    }
    var po = new Lit(s);
    po.tag = ++__nodeCounter__;
    sp.length = this.reader.pos - sp.pos + 1;
    po.sp = sp;
    return po;
  }

SchemeTokenizer.prototype.parseNumber =
  function (c)
  {
    var sp = {pos:this.reader.pos, line:this.reader.line, linePos:this.reader.linePos};
    var s = c;
//    var dot = false;
    var slash = false;
    while (!Character.isWhitespace(c = this.reader.peek()) && c !== ")" && c !== "")
    {
      s += this.reader.read();
//      dot |= (c === '.');
      slash |= (c === '/');
    }
    var po;
    if (slash)
    {
      throw new Error("TODO");
    }
    var po = new Lit(parseInt(s));
    po.tag = ++__nodeCounter__;
    sp.length = this.reader.pos - sp.pos;
    po.sp = sp;
    return po;
  }

SchemeTokenizer.prototype.parseList =
  function ()
  {
    var sp = {pos:this.reader.pos, line:this.reader.line, linePos:this.reader.linePos};
    var lookahead = this.skipWhitespace();
    if (lookahead === ")")
    {
      var po = new Null();
      po.tag = ++__nodeCounter__;
      sp.length = this.reader.pos - sp.pos;
      po.sp = sp;
      return po;
    }
    var es = [];
    do
    {
      var e = this.parse(lookahead);
      es.push(e);
      lookahead = this.skipWhitespace();
      if (lookahead === "")
      {
        throw new Error("unmatched )");
      }
      if (lookahead === ".")
      {
        lookahead = this.skipWhitespace();
        var po = this.parse(lookahead);
        this.reader.read();
        po = es.reduceRight(function (acc, x) {var p=new Pair(x, acc); p.tag=++__nodeCounter__; return p}, po);
        po.tag = ++__nodeCounter__;
        sp.length = this.reader.pos - sp.pos;
        po.sp = sp;
        return po;
      }
    }
    while (lookahead !== ")");
    var nll = new Null();
    nll.tag = ++__nodeCounter__;
    var po = es.reduceRight(function (acc, x) {var p=new Pair(x, acc); p.tag=++__nodeCounter__; return p}, nll);
    po.tag = ++__nodeCounter__;
    sp.length = this.reader.pos - sp.pos;
    po.sp = sp;
    return po;
  }

SchemeTokenizer.prototype.parseVector =
  function ()
  {
    var sp = {pos:this.reader.pos, line:this.reader.line, linePos:this.reader.linePos};
    var lookahead = this.skipWhitespace();
    var po;
    if (lookahead === ")")
    {
      po = [];
    }
    else
    {
      po = [];
      do
      {
        var e = this.parse(lookahead);
        po.push(e);
        lookahead = this.skipWhitespace();
      }
      while (lookahead !== ")");
    }
    po.tag = ++__nodeCounter__;
    sp.length = this.reader.pos - sp.pos;
    po.sp = sp;
    return po;    
  }

SchemeTokenizer.prototype.skipWhitespace =
  function ()
  {
    var c;
    while (true)
    {
      while (Character.isWhitespace(c = this.reader.read()));
      if (c === ";")
      {
        c = this.reader.read();
        while ((c = this.reader.read()) !== "\n" && c !== "");
      }
      else
      {
        break;
      }
    }
    return c;
  }