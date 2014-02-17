function ConcLattice()
{
	return (function ()
	{
		var module = Object.create(Lattice.prototype);
    
    
    var Top = Object.create(new LatticeValue()); 
    Top.join = function (other) { return Top };
    Top.meet = function (other) { return other };
    Top.compareTo = function (other) { return other === Top ? 0 : 1 };
    Top.hashCode = function () { return 7 };
    Top.isAddress = function () { return false };
//    Top.addresses = function () { return false }; considered to be primitive top, so addresses []
//    Top.conc = function () { return false };
    Top.toString = function () { return "^" };
    Top.nice = function () { return "^" };
    Top.ToBoolean = function () { return Top };
    Top.ToString = function () { return Top };
    Top.ToNumber = function () { return Top };
    Top.length = function () { return Top };
    Top.accept = function (visitor) { return visitor.visitTop(Top) };
          
      module.add =
        function (x, y)
        {
          return x + y;
        }
        
      module.sub =
        function (x, y)
        {
          return x - y;
        }

      module.mul =
        function (x, y)
        {
          return x * y;
        }
        
      module.div =
        function (x, y)
        {
          return x / y;
        }
        
      module.isEq =
        function (x, y)
        {
          return x === y;
        }

      module.equals =
        function (x, y)
        {
          return Eq.equals(x, y);
        }

//      module.neqq =
//        function (x, y)
//        {
//          if (x === Tru || x === Fals || x === Nul) {return (x !== y) ? [Tru] : [Fals]};
//          return [Tru, Fals];
//        }

//      module.neq =
//        function (x, y)
//        {
//          if (x === Num && y === Num)
//          {
//            return [Tru, Fals];
//          }
//          return [];
//        }

      module.lt =
        function (x, y)
        {
          return x < y;
        }

      module.lte =
        function (x, y)
        {
          return x <= y;
        }

      module.gt =
        function (x, y)
        {
          return x > y;
        }
    
      module.gte =
        function (x, y)
        {
          return x >= y;
        }
        
      module.neg =
        function (x)
        {
          return -x;
        }

      module.mod =
        function (x, y)
        {
          return x % y;
        }
      
      module.ceil =
        function (x)
        {
          return Math.round(x);
        }
      module.quot =
        function (x, y)
        {
          return Math.floor(x/y); 
        }
      module.gcd =
        function (x, y)
        {
          if (x == 0) { return y }
          if (y != 0)
          {
            if (x > y)
            {
              return gcd(x - y, y);
            }
            return gcd(x, y - x);
          }
          return x;
        }
      module.log =
        function (x)
        {
          return Math.log(x);
        }
      module.isEven =
        function (x)
        {
          return x % 2 === 0;
        }
      module.isOdd =
        function (x)
        {
          return x % 2 !== 0;
        }

      module.not =
        function (x)
        {
          return !x;
        }

      module.isNull =
        function (x)
        {
          return x instanceof Null;
        }

      module.isPair =
        function (x)
        {
          return x instanceof Pair;
        }
      module.isSymbol =
        function (x)
        {
          return x instanceof Sym;
        }
      module.car =
        function (x)
        {
          return x.car;
        }
      module.cdr =
        function (x)
        {
          return x.cdr;
        }
      module.reverse =
        function (x)
        {
          return x.reverse();
        }
      module.cons =
        function (x,y)
        {
          return new Pair(x, y);
        }

      module.sqrt =
        function (x)
        {
          return Math.sqrt(x);
        }
      
    module.abst1 =
      function (cvalue)
      {
        return cvalue;
      }
        
    module.NUMBER = Num;
    module.STRING = Str;
//    module.BOOLEAN = Bool;
    module.SYMBOL = Sy;
    module.TOP = Top;
    module.TRUE = Tru;
    module.FALSE = Fals;
    
    module.toString = function () {return "ConcLattice"}
      
		return module;
	})();
}