var suiteLcipdaTests = 

(function () 
{
  var module = new TestSuite("suiteLcipdaTests");

  function run(src, cesk, expected)
  {
    var ast = new SchemeParser().parse(src)[0];
    var result = new Pushdown().analyze(ast, cesk);
    var actual = result.stepFwOver(result.initial).map(function (c) {return c.q.value}).reduce(Lattice.join, BOT);
    assertEquals(expected, actual);
  }
  
  function createCesk(cc)
  {
    cc = cc || {};
    return lcCesk({a:cc.a || create1cfaTagAg(), l:cc.l || new Lattice1()});
  }
  
  module.test1a =
    function ()
    {
      var cesk = createCesk();
      run("42", cesk, cesk.l.abst1(42));
    }
    
  module.test12a =
  	function ()
  	{
  		var src = "(letrec ((sq (lambda (x) (* x x)))) (sq 5) (sq 6))";
  		var cesk = createCesk();
      run(src, cesk, cesk.l.abst1(36));
  	}

//  module.test19a = // HANGS with GC
//  	function ()
//  	{
//  		var src = "(letrec ((count (lambda (n) (if (= n 0) \"done\" (count (- n 1)))))) (count 200))";
//      var cesk = createCesk();
//      run(src, cesk, cesk.l.abst1("done"));
//  	}
  	
 module.test20a =
   function ()
   {
     var src = "(letrec ((f (lambda () (f)))) (f))";
     var cesk = createCesk();
     run(src, cesk, BOT);
   }
 
// module.test20b = // HANGS with GC
//   function ()
//   {
//     var src = "(letrec ((t (lambda (x) (t (+ x 1))))) (t 0))";
//     var cesk = createCesk();
//     run(src, cesk, BOT);
//   }
   
    module.testGcIpd =
      function ()
      {
        var src = read("test/resources/gcIpdExample.scm");
        var cesk = createCesk()
        run(src, cesk, cesk.l.NUMBER);
      }  	
  	
    module.testRotate =
      function ()
      {
        var src = read("test/resources/rotate.scm");
        var cesk = createCesk({p:new SetLattice(3)});
        run(src, cesk, cesk.l.abst([5, true, "hallo"]));
      }
    
    module.testFac =
      function ()
      {
        var src = "(letrec ((f (lambda (n) (if (= n 0) 1 (* n (f (- n 1))))))) (f 10))";
        var cesk = createCesk();
        run(src, cesk, cesk.l.NUMBER);
      }
    
    module.testFib =
      function ()
      {
        var src = "(letrec ((fib (lambda (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))))) (fib 4))";
        var cesk = createCesk();
        run(src, cesk, cesk.l.NUMBER);
      }
          
//    module.test100 =  SET!
//      function ()
//      {
//        var src = "var z=false; function f(n) {if (n===10) {g()}; if (n>0) {f(n-1)}}; function g() {z=true}; f(20); z"
//        var cesk = createCesk();
//        run(src, cesk, cesk.l.abst([true, false]));
//      }
    
//    module.test101 = //HANGS, !retval! or finite-width lattice? 
//      function ()
//      {
//        var src = "(letrec ((g (lambda () 1)) (f (lambda (n) (if (= n 0) 0 (+ (f (- n 1)) (g)))))) (f 10))";
//        var cesk = createCesk();
//        run(src, cesk, cesk.l.NUMBER);
//      }
    
//    module.testChurchNums = // TODO slow + errors
//    function ()
//    {
//      var src = read("test/resources/churchNums.scm");
//      var cesk = createCesk();
//      run(src, cesk, cesk.l.NUMBER);
//    }    
    
  return module;

})()


