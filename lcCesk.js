function lcCesk(cc)
{
  // address generator
  var a = cc.a;
  // benv creator
//  var b = cc.b || new DefaultBenv();
  // lattice
  var l = cc.l;
  
  var gcFlag = cc.gc === undefined ? true : cc.gc;
  var memoFlag = cc.memo === undefined ? false : cc.memo;
  var memoTable = MemoTable.empty();
  var impureApps = ArraySet.empty();
  
  assertDefinedNotNull(a);
  assertDefinedNotNull(l);

  // lattice (primitives + procs)
//  var l = new JipdaLattice(p); // in this CESK, prims and procs don't match!
  
  print("alloc", a, "lat", l, "gc", gcFlag, "memo", memoFlag);
  
  // install constants
  var L_UNDEFINED = SetValue.from1(l.abst1(undefined));
  var L_TRUE = SetValue.from1(l.abst1(true));
  var L_FALSE = SetValue.from1(l.abst1(false));
  var L_BOOLEAN = L_TRUE.join(L_FALSE);
  
  function Closure(node, statc, params, body)
  {
    assertFalse(node == null);
    this.node = node;
    this.statc = statc;
    this.params = params;
    this.body = body;
  }

  Closure.prototype.toString =
    function ()
    {
      return "<Closure " + this.node.tag + ">";
    }
  Closure.prototype.nice =
    function ()
    {
      return "<Closure " + this.node.tag + ">";
    }

  Closure.prototype.equals =
    function (other)
    {
      if (this === other)
      {
        return true;
      }
      if (!(this instanceof Closure))
      {
        return false;
      }
      return this.node === other.node
        && this.statc.equals(other.statc);
    }
  
  Closure.prototype.hashCode =
    function (x)
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.statc.hashCode();
      return result;      
    }
  
  Closure.prototype.apply_ =
    function (application, operandValues, benv, callStore, kont)
    {
//      print("apply", application, operandValues);
      var fun = this.node;
      
      if (memoFlag)
      {
        var m = memoTable.get(fun, operandValues, callStore);
        var memoStore = m[0];
        var memoValue = m[1];
        if (memoStore !== BOT)
        {
          return kont.pop(function (frame) {return new KontState(frame, memoValue, memoStore)}, "MEMO");
        }
      }

      var extendedBenv = this.statc.copy();
      var extendedStore = callStore;
      var params = this.params;
      var i = 0;
      while (!(params instanceof Null))
      {
        if (operandValues[i] == null)
        {
          return [];
        }
        var param = params.car;
        var name = param.name;
        var addr = a.variable(param, application.tag);
        extendedBenv = extendedBenv.add(name, addr);
        extendedStore = extendedStore.allocAval(addr, operandValues[i]);
        params = params.cdr;
        i++;
      }
            
//      if (!(this.body.cdr instanceof Null))
//      {
//        throw new Error("expected single body expression, got " + this.body);
//      }
      var exp = this.body.car;      
//      var atomicValue = evalAtomic(exp, extendedBenv, extendedStore);
//      if (atomicValue)
//      {
//        return handleReturnValue(atomicValue, fun, extendedStore, extendedStore, kont);
//      }
      extendedBenv.application = application;
      var frame = new ReturnKont(application, fun, operandValues, callStore);
      return kont.push(frame, new EvalState(exp, extendedBenv, extendedStore));
//      return kont.unch(new EvalState(exp, extendedBenv, extendedStore));
    }

  Closure.prototype.addresses =
    function ()
    {
      return this.statc.addresses();
    }
  
  Closure.prototype.ToBoolean =
    function ()
    {
      return l.Tru;
    }
  
  function Primitive(name, apply_)
  {
    this.name = name;
    this.apply_ = apply_;
  }
  
  Primitive.prototype.equals =
    function (x)
    {
      if (this === x)
      {
        return true;
      }
      return x instanceof Primitive
        && this.name === x.name 
    }
  
  Primitive.prototype.hashCode =
    function ()
    {
      return this.name.hashCode();
    }
  
  Primitive.prototype.addresses =
    function ()
    {
      return [];
    }
  
  Primitive.prototype.toString =
    function ()
    {
      return this.name;
    }
   
  
  // install global environment
  var global = Benv.empty();
  var store = new Store();
  
  function installPrimitive(name, apply_)
  {
    var proca = new ContextAddr(name, 0);
    var proc = SetValue.from1(new Primitive(name, apply_));
    global = global.add(name, proca);
    store = store.allocAval(proca, proc);    
  }
  
  function installVariable(name, value)
  {
    var vara = new ContextAddr(name, 0);
    global = global.add(name, vara);
    store = store.allocAval(vara, value);    
  }
  
  function processErrors(values, node, benv, store, kont)
  {
//    var okValues = values.filter(function (v) {return !(v instanceof Error)});
//    if (okValues.length === values.length)
//    {
//      return kont.pop(function (frame) {return new KontState(frame, SetValue.from(okValues), store)});
//    }
//    var errors = values.filter(function (v) {return v instanceof Error});
//    var result = okValues.length > 0 ? kont.pop(function (frame) {return new KontState(frame, SetValue.from(okValues), store)}) : [];
//    result = errors.reduce(
//      function (result, error)
//      {
//        return result.concat(kont.unch(new ErrorState(error.toString(), node, benv, store)))
//      }, result);
//    return result;
    return kont.pop(function (frame) {return new KontState(frame, SetValue.from(values), store)});
  }
  
  installVariable("#t", L_TRUE);
  installVariable("#f", L_FALSE);
  
  installPrimitive("+", 
    function(application, operandValues, benv, store, kont)
    {
      var values = operandValues[0].values()
        .flatMap(
          function (v1)
          {
            return operandValues[1].values().flatMap(
              function (v2)
              {
                return l.add(v1, v2);
              });
          });
      return processErrors(values, application, benv, store, kont);
    });
  installPrimitive("-", 
    function(application, operandValues, benv, store, kont)
    {
      var values = operandValues[0].values()
        .flatMap(
          function (v1)
          {
            return operandValues[1].values().flatMap(
              function (v2)
              {
                return l.sub(v1, v2);
              });
          });
      return processErrors(values, application, benv, store, kont);
    });
  installPrimitive("*", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
          .flatMap(
            function (v1)
            {
              return operandValues[1].values().flatMap(
                function (v2)
                {
                  return l.mul(v1, v2);
                });
            });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("/", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
          .flatMap(
            function (v1)
            {
              return operandValues[1].values().flatMap(
                function (v2)
                {
                  return l.div(v1, v2);
                });
            });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("=", 
    function(application, operandValues, benv, store, kont)
    {
      var values = operandValues[0].values()
        .flatMap(
          function (v1)
          {
            return operandValues[1].values().flatMap(
              function (v2)
              {
                return l.equals(v1, v2);
              });
          });
      return processErrors(values, application, benv, store, kont);
    });
  installPrimitive("<", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
          .flatMap(
            function (v1)
            {
              return operandValues[1].values().flatMap(
                function (v2)
                {
                  return l.lt(v1, v2);
                });
            });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive(">", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
          .flatMap(
            function (v1)
            {
              return operandValues[1].values().flatMap(
                function (v2)
                {
                  return l.gt(v1, v2);
                });
            });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("<=", 
    function(application, operandValues, benv, store, kont)
    {
      var values = operandValues[0].values()
        .flatMap(
          function (v1)
          {
            return operandValues[1].values().flatMap(
              function (v2)
              {
                return l.lte(v1, v2);
              });
          });
      return processErrors(values, application, benv, store, kont);
    });
  installPrimitive("not", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.not(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("null?", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.isNull(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("pair?", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.isPair(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("car", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.car(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("cdr", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.cdr(value); 
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("cons", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
          .flatMap(
            function (v1)
            {
              return operandValues[1].values().flatMap(
                function (v2)
                {
                  return l.cons(v1, v2);
                });
            });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("eq?", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
          .flatMap(
            function (v1)
            {
              return operandValues[1].values().flatMap(
                function (v2)
                {
                  return l.isEq(v1, v2);
                });
            });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("equal?", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
          .flatMap(
            function (v1)
            {
              return operandValues[1].values().flatMap(
                function (v2)
                {
                  return l.isEq(v1, v2);
                });
            });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("char?", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.isChar(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("symbol?", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.isSymbol(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("random", 
      function(application, operandValues, benv, store, kont)
      {
        var values = l.random();
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("modulo", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
          .flatMap(
            function (v1)
            {
              return operandValues[1].values().flatMap(
                function (v2)
                {
                  return l.mod(v1, v2);
                });
            });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("remainder", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
          .flatMap(
            function (v1)
            {
              return operandValues[1].values().flatMap(
                function (v2)
                {
                  return l.mod(v1, v2); // wrong, but hey...
                });
            });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("quotient", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
        .flatMap(
          function (v1)
          {
            return operandValues[1].values().flatMap(
              function (v2)
              {
                return l.quot(v1, v2);
              });
          });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("ceiling", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.ceil(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("log", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.log(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("gcd", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values()
        .flatMap(
          function (v1)
          {
            return operandValues[1].values().flatMap(
              function (v2)
              {
                return l.gcd(v1, v2);
              });
          });
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("even?", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.isEven(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("odd?", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.isOdd(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("reverse", 
      function(application, operandValues, benv, store, kont)
      {
        var values = operandValues[0].values().flatMap(function (value)
            {
              return l.reverse(value);
            })
        return processErrors(values, application, benv, store, kont);
      });
  installPrimitive("error", 
      function(application, operandValues, benv, store, kont)
      {
        return [];
      });
   
  
  function InitState(node, benv, store, haltFrame)
  {
    this.type = "init";
    this.node = node;
    this.benv = benv;
    this.store = store;
    this.haltFrame = haltFrame;
  }
  InitState.prototype.toString =
    function ()
    {
      return "#init " + this.node.tag; 
    }
  InitState.prototype.nice =
    function ()
    {
      return "#init " + this.node.tag;
    }
  InitState.prototype.equals =
    function (x)
    {
      return this.type === x.type
        && this.node === x.node 
        && Eq.equals(this.benv, x.benv)
        && Eq.equals(this.store, x.store)
        && Eq.equals(this.haltFrame, x.haltFrame);
    }
  InitState.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benv.hashCode();
      result = prime * result + this.haltFrame.hashCode();
      return result;
    }
  InitState.prototype.next =
    function (kont)
    {
      return kont.push(this.haltFrame, new EvalState(this.node, this.benv, this.store));
    }
  InitState.prototype.addresses =
    function ()
    {
      return this.benv.addresses();
    }
  
  function gc(q, kont)
  {
    var store = q.store;
    if (gcFlag)
    {
      var stackAddresses = kont.ss.addresses();
      var rootSet = q.addresses().concat(stackAddresses);
      var gcStore = Agc.collect(store, rootSet);
      return gcStore;
    }
    else
    {
      return store;
    }
  }    

  function EvalState(node, benv, store)
  {
    this.type = "eval";
    assertDefinedNotNull(node);
    this.node = node;
    this.benv = benv.narrow(freeVariables(node));
//    this.benv = benv;
    this.store = store;
  }
  EvalState.prototype.toString =
    function ()
    {
      return "#eval " + this.node.tag;
    }
  EvalState.prototype.nice =
    function ()
    {
      return "#eval " + this.node.tag;
    }
  EvalState.prototype.equals =
    function (x)
    {
      return (x instanceof EvalState)
        && this.node === x.node 
        && Eq.equals(this.benv, x.benv)
        && Eq.equals(this.store, x.store);
    }
  EvalState.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benv.hashCode();
      return result;
    }
  EvalState.prototype.next =
    function (kont)
    {
      return evalNode(this.node, this.benv, gc(this, kont), kont);
    }
  EvalState.prototype.addresses =
    function ()
    {
      return this.benv.addresses();
    }
  
  function KontState(frame, value, store)
  {
    this.type = "kont";
    this.frame = frame;
    this.value = value;
    this.store = store;
  }
  KontState.prototype.equals =
    function (x)
    {
      return (x instanceof KontState)
        && Eq.equals(this.frame, x.frame) 
        && Eq.equals(this.value, x.value) 
        && Eq.equals(this.store, x.store)
    }
  KontState.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.frame.hashCode();
      result = prime * result + this.value.hashCode();
      return result;
    }
  KontState.prototype.toString =
    function ()
    {
      return "#kont-" + this.frame;
    }
  KontState.prototype.nice =
    function ()
    {
      return "#kont-" + this.frame.toString();
    }
  KontState.prototype.next =
    function (kont)
    {
//    try {
      return applyKont(this.frame, this.value, gc(this, kont), kont)
//    } catch (e)
//    {
//      return kont.unch(new ErrorState(String(e), this.value, Benv.empty(), this.store));
//    }
    }
  KontState.prototype.addresses =
    function ()
    {
      return this.frame.addresses().concat(this.value.addresses());
    }
    
  function LetrecKont(node, benv)
  {
    this.node = node;
    this.benv = benv;
  }
  LetrecKont.prototype.equals =
    function (x)
    {
      return x instanceof LetrecKont
        && this.node === x.node 
        && Eq.equals(this.benv, x.benv) 
    }
  LetrecKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benv.hashCode();
      return result;
    }
  LetrecKont.prototype.toString =
    function ()
    {
      return "letrec-" + this.node.tag;
    }
  LetrecKont.prototype.nice =
    function ()
    {
      return "letrec-" + this.node.tag;
    }
  LetrecKont.prototype.addresses =
    function ()
    {
      return this.benv.addresses();
    }
  LetrecKont.prototype.apply =
    function (bindingValue, store, kont)
    {
      var node = this.node;
      var benv = this.benv;
      var bindings = node.cdr.car;
      var binding = bindings.car;
      var name = binding.car.name;      
      var addr = benv.lookup(name);
      store = store.updateAval(addr, bindingValue);
      var body = node.cdr.cdr;
      return evalBody(body, benv, store, kont);
    }
    
  function evalBody(exps, benv, store, kont)
  {
    if (exps.cdr instanceof Null)
    {
      var exp = exps.car;
      return kont.unch(new EvalState(exp, benv, store));          
    }
    throw new Error("begin");    
  }
  
  function LetKont(node, benv)
  {
    this.node = node;
    this.benv = benv;
  }
  LetKont.prototype.equals =
    function (x)
    {
      return x instanceof LetKont
        && this.node === x.node 
        && Eq.equals(this.benv, x.benv) 
    }
  LetKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benv.hashCode();
      return result;
    }
  LetKont.prototype.toString =
    function ()
    {
      return "let-" + this.node.tag;
    }
  LetKont.prototype.nice =
    function ()
    {
      return "let-" + this.node.tag;
    }
  LetKont.prototype.addresses =
    function ()
    {
      return this.benv.addresses();
    }
  LetKont.prototype.apply =
    function (bindingValue, store, kont)
    {
      var node = this.node;
      var benv = this.benv;
      return bindLetVar(node, bindingValue, benv, store, kont);
    }
  
  function bindLetVar(node, bindingValue, benv, store, kont)
  {
    var bindings = node.cdr.car;
    var binding = bindings.car;
    var name = binding.car.name;      
    var addr = a.variable(binding, benv.application ? benv.application.tag : null);
    benv = benv.add(name, addr);
    store = store.allocAval(addr, bindingValue);      
    var body = node.cdr.cdr;
    return evalBody(body, benv, store, kont);
  }
    
  function IfKont(node, benv)
  {
    this.node = node;
    this.benv = benv;
  }
  IfKont.prototype.equals =
    function (x)
    {
      return x instanceof IfKont
        && this.node === x.node 
        && Eq.equals(this.benv, x.benv);
    }
  IfKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benv.hashCode();
      return result;
    }
  IfKont.prototype.toString =
    function ()
    {
      return "if-" + this.node.tag;
    }
  IfKont.prototype.nice =
    function ()
    {
      return "if-" + this.node.tag;
    }
  IfKont.prototype.addresses =
    function ()
    {
      return this.benv.addresses();
    }
  IfKont.prototype.apply =
    function (conditionValue, store, kont)
    {
      var node = this.node;
      var benv = this.benv;
      return dispatchConditional(node, conditionValue, benv, store, kont); 
    }
  
  function dispatchConditional(node, conditionValue, benv, store, kont)
  {
    var consequent = node.cdr.cdr.car;
    var alternate = node.cdr.cdr.cdr.car;
    var tfb = trueFalse(conditionValue);
    if (tfb.equals(L_BOOLEAN))
    {
      var consequentState = kont.unch(new EvalState(consequent, benv, store));
      var alternateState = kont.unch(new EvalState(alternate, benv, store));
      return consequentState.concat(alternateState);
    }
    else if (tfb.equals(L_TRUE))
    {
      return kont.unch(new EvalState(consequent, benv, store));
    }
    else
    {
      return kont.unch(new EvalState(alternate, benv, store));
    }    
  }
  
  function trueFalse(conditionValue)
  {
    return SetValue.from(conditionValue._set._arr.map(
      function (av)
      {
        return av.ToBoolean()
      }));
  }
  
  function ReturnKont(node, lam, operandValues, callStore)
  {
    this.node = node;
    this.lam = lam;
    this.operandValues = operandValues;
    this.callStore = callStore;
  }
  ReturnKont.prototype.equals =
    function (x)
    {
      return x instanceof ReturnKont
        && Eq.equals(this.node, x.node)
        && Eq.equals(this.lam, x.lam)
        && Eq.equals(this.callStore, x.callStore)
    }
  ReturnKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.lam.hashCode();
      return result;
    }
  ReturnKont.prototype.toString =
    function ()
    {
      return "ret-" + this.node.tag;
    }
  ReturnKont.prototype.nice =
    function ()
    {
      return "ret-" + this.node.tag;
    }
  ReturnKont.prototype.addresses =
    function ()
    {
//      return this.extendedBenv.addresses();
      return [];
    }
  ReturnKont.prototype.apply =
    function (returnValue, returnStore, kont)
    {
      if (memoFlag)
      {
        var application = this.node;
        if (!impureApps.contains(application))
        {
          var lam = this.lam;
          var operandValues = this.operandValues;
          var callStore = this.callStore; 
          memoTable = memoTable.put(lam, operandValues, callStore, returnValue);
        }
      }
      return kont.pop(function (frame) {return new KontState(frame, returnValue, returnStore)});
    }
  
  function evalLiteral(node, benv, store)
  {
    var value = SetValue.from1(l.abst1(node));
    return value;
  }

  function evalQuote(node, benv, store)
  {
    var quoted = node.cdr.car;
    var value = SetValue.from1(l.abst1(quoted));
    return value;
//    if (quoted instanceof Number || quoted instanceof String || quoted instanceof Boolean)
//    {
//      return evalLiteral(quoted, benv, store, kont);
//    }
//    if (quoted instanceof Sym)
//    {
//      var value = SetValue.from1(new ASym(quoted.name));
//      return kont.pop(function (frame) {return new KontState(frame, value, store)});
//    }
//    if (quoted instanceof Pair)
//    {
//      var value = SetValue.from1(new APair(quoted.name))
//      return kont.pop(function (frame) {return new KontState(frame, SetValue.from1(new ASym(quoted.name)), store)});
//    }
  }

  function evalLambda(node, benv, store, kont)
  {
    var closure = new Closure(node, benv, node.cdr.car, node.cdr.cdr);
    var proc = SetValue.from1(closure);
    return proc;
  }

  function evalIdentifier(node, benv, store)
  {
    var name = node.name;
    var addr = benv.lookup(name);
    if (addr === BOT)
    {
      throw new Error("undefined: " + node);
    }
    var value = store.lookupAval(addr);
    return value;
  }
  
  function evalLet(node, benv, store, kont)
  {
    var bindings = node.cdr.car;
    var binding = bindings.car;
    var exp = binding.cdr.car;
//    var atomicValue = evalAtomic(exp, benv, store);
//    if (atomicValue)
//    {
//       return bindLetVar(node, atomicValue, benv, store, kont);
//    }
    var frame = new LetKont(node, benv);
    return kont.push(frame, new EvalState(exp, benv, store));
  }
  
  function evalSet(node, benv, store, kont)
  {
    var name = node.cdr.car.name;
    var exp = node.cdr.cdr.car;
    var addr = benv.lookup(name); 
    var atomicValue =  evalAtomic(exp, benv, store);
    store = store.updateAval(addr, atomicValue);
    if (memoFlag)
    {
      var apps = kont.ss._apps.values();
      impureApps = impureApps.addAll(apps);
      print(apps, "=> impure now", impureApps);
    }
    return kont.pop(function (frame) {return new KontState(frame, L_UNDEFINED, store)});
  }
  
  function evalLetrec(node, benv, store, kont)
  {
    var bindings = node.cdr.car;
    var binding = bindings.car;
    var name = binding.car.name;
    var exp = binding.cdr.car; // call ?
    var addr = a.variable(binding, benv.application ? benv.application.tag : null);
    benv = benv.add(name, addr);
    store = store.allocAval(addr, BOT);
    var frame = new LetrecKont(node, benv);
    return kont.push(frame, new EvalState(exp, benv, store));
  }
  
  function isApplication(node)
  {
    return node instanceof Pair
      && !SchemeParser.isSyntacticKeyword(node.car.name)
  }
    
  function applyKont(frame, value, store, kont)
  {
    return frame.apply(value, store, kont);
  }
  
  function evalIf(node, benv, store, kont)
  {
    var condition = node.cdr.car;
    var atomicValue = evalAtomic(condition, benv, store);
    return dispatchConditional(node, atomicValue, benv, store, kont);
  }
  
  function evalAnd(node, benv, store, kont)
  {
    var condition = node.cdr.car;
    var conditionValue = evalAtomic(condition, benv, store);
    var alternate = node.cdr.cdr.car;
    var tfb = trueFalse(conditionValue);
    if (tfb.equals(L_BOOLEAN))
    {
      var consequentState = kont.unch(new EvalState(alternate, benv, store));
      var alternateState = kont.pop(function (frame) {return new KontState(frame, conditionValue, store)});
      return consequentState.concat(alternateState);
    }
    else if (tfb.equals(L_TRUE))
    {
      return kont.unch(new EvalState(alternate, benv, store));
    }
    else
    {
      return kont.pop(function (frame) {return new KontState(frame, conditionValue, store)});
    }
  }
  
  function evalOr(node, benv, store, kont)
  {
    var condition = node.cdr.car;
    var conditionValue = evalAtomic(condition, benv, store);
    var alternate = node.cdr.cdr.car;
    var tfb = trueFalse(conditionValue);
    if (tfb.equals(L_BOOLEAN))
    {
      var consequentState = kont.pop(function (frame) {return new KontState(frame, conditionValue, store)});
      var alternateState = kont.unch(new EvalState(alternate, benv, store));
      return consequentState.concat(alternateState);
    }
    else if (tfb.equals(L_TRUE))
    {
      return kont.pop(function (frame) {return new KontState(frame, conditionValue, store)});
    }
    else
    {
      return kont.unch(new EvalState(alternate, benv, store));
    }
  }
  
  function evalApplication(node, benv, store, kont)
  {
    var operator = node.car;
    var atomicOperator = evalAtomic(operator, benv, store);
    var operands = node.cdr;
    var operandValues = [];
    while (!(operands instanceof Null))
    {
      var operand = operands.car;
      var atomicOperand = evalAtomic(operand, benv, store)
      operandValues = operandValues.addLast(atomicOperand);
      operands = operands.cdr;
    }
    return atomicOperator.values().flatMap(
      function (operatorValue)
      {
        if (!(operatorValue.apply_))
        {
          return [];
        }        
        return operatorValue.apply_(node, operandValues, benv, store, kont);
      });
  }
  
  function evalAtomic(node, benv, store)
  {
    if (node instanceof Number || node instanceof Boolean || node instanceof String)
    {
      return evalLiteral(node, benv, store);        
    }
    if (node instanceof Sym)
    {
      return evalIdentifier(node, benv, store);
    }
    if (node instanceof Pair)
    {
      var car = node.car;
      if (car instanceof Sym)
      {
        var name = car.name;
        if (name === "lambda")
        {
          return evalLambda(node, benv, store);
        }
        if (name === "quote")
        {
          return evalQuote(node, benv, store);
        }
      }
    }
    throw new Error("not atomic: " + node);
  }

  function evalNode(node, benv, store, kont)
  {  
    if (node instanceof Number || node instanceof Boolean || node instanceof String)
    {
      var value = evalLiteral(node, benv, store); 
      return kont.pop(function (frame) {return new KontState(frame, value, store)});        
    }
    if (node instanceof Sym)
    {
      var value = evalIdentifier(node, benv, store);
      return kont.pop(function (frame) {return new KontState(frame, value, store)});
    }
    if (node instanceof Pair)
    {
      var car = node.car;
      if (car instanceof Sym)
      {
        var name = car.name;
        if (name === "lambda")
        {
          var value = evalLambda(node, benv, store);
          return kont.pop(function (frame) {return new KontState(frame, value, store)});
        }
        if (name === "let")
        {
          return evalLet(node, benv, store, kont);
        }
        if (name === "letrec")
        {
          return evalLetrec(node, benv, store, kont);
        }
        if (name === "if")
        {
          return evalIf(node, benv, store, kont);
        }
//        if (name === "begin")
//        {
//          return evalBegin(node, benv, store, kont);
//        }
        if (name === "set!")
        {
          return evalSet(node, benv, store, kont);
        }
        if (name === "quote")
        {
          var value = evalQuote(node, benv, store);
          return kont.pop(function (frame) {return new KontState(frame, value, store)});
        }
        if (name === "and")
        {
          return evalAnd(node, benv, store, kont);
        }
        if (name === "or")
        {
          return evalOr(node, benv, store, kont);
        }
      }
      return evalApplication(node, benv, store, kont);
    }
    throw new Error("cannot handle node " + node); 
  }
  
  function RaAppStackSummary(addresses, apps)
  {
    this._addresses = addresses;
    this._apps = apps;
  }

  RaAppStackSummary.empty =
    function ()
    {
      return new RaAppStackSummary(ArraySet.empty(), ArraySet.empty());
    }

  RaAppStackSummary.prototype.toString =
    function ()
    {
      return this._addresses + "[" + this._apps + "]";
    }

  RaAppStackSummary.prototype.equals =
    function (x)
    {
      return (x instanceof RaAppStackSummary)
        && this._addresses.equals(x._addresses)
        && this._apps.equals(x._apps)
    }

  RaAppStackSummary.prototype.subsumes =
    function (x)
    {
      return (x instanceof RaAppStackSummary)
        && this._addresses.subsumes(x._addresses)
        && this._apps.subsumes(x._apps)
    }

  RaAppStackSummary.prototype.hashCode =
    function ()
    {
      var prime = 43;
      var result = 1;
      result = prime * result + this._addresses.hashCode();
      result = prime * result + this._apps.hashCode();
      return result;    
    }

  RaAppStackSummary.prototype.push =
    function (frame)
    {
      var addresses = this._addresses.addAll(frame.addresses());
      var apps = frame instanceof ReturnKont ? this._apps.add(frame.node) : this._apps;
      return new RaAppStackSummary(addresses, apps);
    }

  RaAppStackSummary.prototype.addresses =
    function ()
    {
      return this._addresses.values();
    }

  var module = {};
  module.l = l;
  module.store = store;
  module.global = global;
  
  module.inject = 
    function (node, override)
    {
      override = override || {};
      var benv = override.benv || global;
      var haltFrame = new HaltKont([]);
      return {q:new InitState(node, benv, override.store || store, haltFrame), ss:RaAppStackSummary.empty()};
    }
  
  return module; 
}

function ErrorState(msg, node, benv, store)
{
  this.type = "error";
  this.msg = msg;
  this.node = node;
  this.benv = benv;
  this.store = store;
}
ErrorState.prototype.toString =
  function ()
  {
    return "#error " + this.msg;
  }
ErrorState.prototype.nice =
  function ()
  {
    return "#error " + this.msg;
  }
ErrorState.prototype.equals =
  function (x)
  {
    return (x instanceof ErrorState)
      && Eq.equals(this.msg, x.msg)
      && this.node === x.node
      && this.benv.equals(x.benv)
      && this.store.equals(x.store)
  }
ErrorState.prototype.hashCode =
  function ()
  {
    var prime = 7;
    var result = 1;
    result = prime * result + this.msg.hashCode();
    result = prime * result + this.node.hashCode();
    result = prime * result + this.benv.hashCode();
    return result;
  }
ErrorState.prototype.next =
  function (kont)
  {
    return [];
  }
ErrorState.prototype.addresses =
  function ()
  {
    return [];
  }

function SetValue(set)
{
  //if (set.size() > 3) {print(set)};
  this._set = set;
}

SetValue.from1 =
  function (x)
  {
    return new SetValue(ArraySet.from1(x));
  }

SetValue.from =
  function (arr)
  {
    return new SetValue(ArraySet.from(arr));
  }

SetValue.prototype.equals =
  function (x)
  {
    if (x === BOT)
    {
      return false;
    }
    return this._set.equals(x._set);
  }

SetValue.prototype.subsumes =
  function (x)
  {
    if (!(x instanceof SetValue))
    {
      return false;
    }
    return this._set.subsumes(x._set);
  }

SetValue.prototype.hashCode =
  function ()
  {
    return this._set.hashCode();
  }
  
SetValue.prototype.addresses =
  function ()
  {
    return this._set.values().flatMap(function (x) {return x.addresses()});
  }

SetValue.prototype.join =
  function (x)
  {
    if (x === BOT)
    {
      return this;
    }
    return new SetValue(this._set.join(x._set));
  }

SetValue.prototype.meet =
  function (x)
  {
    if (x === BOT)
    {
      return BOT;
    }
    var setMeet = this._set.meet(x._set);
    if (setMeet.size() === 0)
    {
      return BOT;
    }
    return new SetValue(setMeet);
  }

SetValue.prototype.values =
  function ()
  {
    return this._set.values();
  }

SetValue.prototype.toString =
  function ()
  {
    return this._set.toString();
  }