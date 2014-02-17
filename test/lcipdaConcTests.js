var suiteLcipdaTests = 

(function () 
{
  var module = new TestSuite("suiteLcipdaConcTests");

  function run(src, cesk)
  {
    var ast = new SchemeParser().parse(src)[0];
    var result = new Pushdown().analyze(ast, cesk);
    var actual = result.stepFwOver(result.initial).map(function (c) {return c.q.value}).reduce(Lattice.join, BOT);
    return actual;
  }
  
  function createCesk(cc)
  {
    cc = cc || {};
    return lcCesk({a:cc.a || create1cfaTagAg(), l:cc.l || new TypeLattice()});
  }
  
  module.test1a =
    function ()
    {
      var cesk = createCesk();
      var actual = run("42", cesk);
      var expected = SetValue.from1(cesk.l.abst1(42));
      assertEquals(expected, actual);
    }
    
  module.test12a =
  	function ()
  	{
  		var src = "(letrec ((sq (lambda (x) (let ((t (* x x))) t)))) (let ((u (sq 5))) (sq 6)))";
  		var cesk = createCesk();
  		var actual = run(src, cesk);
  		var expected = SetValue.from1(cesk.l.abst1(36));
  		assertEquals(expected, actual);
  	}

  module.test19a =
  	function ()
  	{
  		var src = "(letrec ((count (lambda (n) (let ((t (= n 0))) (if t \"done\" (let ((u (- n 1))) (let ((v (count u))) v))))))) (count 200))";
      var cesk = createCesk();
      var actual = run(src, cesk);
      var expected = SetValue.from1(cesk.l.abst1("done"));
      assertEquals(expected, actual);
  	}
  	
 module.test20a =
   function ()
   {
     var src = "(letrec ((f (lambda () (f)))) (f))";
     var cesk = createCesk();
     var actual = run(src, cesk);
     var expected = BOT;
     assertEquals(expected, actual);
   }
 
 module.test20b =
   function ()
   {
     var src = "(letrec ((t (lambda (x) (let ((u (+ x 1))) (let ((v (t u))) v))))) (let ((w (t 0))) w))";
     var cesk = createCesk();
     var actual = run(src, cesk);
     var expected = BOT;
     assertEquals(expected, actual);
   }
   
 module.test101 = 
   function ()
   {
     var src = "(let ((g (lambda () 1))) (letrec ((f (lambda (n) (let ((t (= n 0))) (if t 0 (let ((u (- n 1))) (let ((v (f u))) (let ((w (g))) (let ((x (+ v w))) x))))))))) (let ((y (f 10))) y)))";
     var cesk = createCesk();
     var actual = run(src, cesk);
     var expected = SetValue.from1(cesk.l.NUMBER);
     assertEquals(expected, actual);
   }
   
 module.testBlur =
   function ()
   {
     var src = read("test/resources/blur.scm");
     var cesk = createCesk();
     var actual = run(src, cesk);
     var expected = SetValue.from([cesk.l.TRUE, cesk.l.FALSE]); // #t
     assertEquals(expected, actual);
   }
 
 module.testEta =
   function ()
   {
     var src = read("test/resources/eta.scm");
     var cesk = createCesk();
     var actual = run(src, cesk);
     var expected = SetValue.from1(cesk.l.FALSE); // #f
     assertEquals(expected, actual);
   }
 
 module.testFac =
   function ()
   {
     var src = read("test/resources/fac.scm");
     var cesk = createCesk();
     var actual = run(src, cesk);
     var expected = SetValue.from1(cesk.l.NUMBER); // 3628800
     assertEquals(expected, actual);
   }
 
// module.testFactor =
//   function ()
//   {
////     var src = "(let ((t " + read("test/resources/factor.scm") + ")) (let ((u (pair? t))) u))";
//     var src = read("test/resources/factor.scm");
//     var cesk = createCesk();
//     var actual = run(src, cesk);
//     //var expected = (mcons 241 (mcons 61511 (mcons 94463 (mcons 25524307 '()))))
//     var expected = SetValue.from1(cesk.l.TRUE);
//     print(actual.constructor);
//     assertEquals(expected, actual);
//   }
 
 module.testFib =
   function ()
   {
     var src = read("test/resources/fib.scm");
     var cesk = createCesk();
     var actual = run(src, cesk);
     var expected = SetValue.from1(cesk.l.NUMBER); // 3
     assertEquals(expected, actual);
   }

 module.testGcIpd =
   function ()
   {
     var src = read("test/resources/gcIpdExample.scm");
     var cesk = createCesk()
     var actual = run(src, cesk);
     var expected = SetValue.from1(cesk.l.NUMBER);
     assertEquals(expected, actual);
   }   
 
 module.testKcfa2 =
   function ()
   {
     var src = read("test/resources/kcfa2.scm");
     var cesk = createCesk()
     var actual = run(src, cesk);
     var expected = SetValue.from1(cesk.l.FALSE); // #f
     assertEquals(expected, actual);
   }   
   
 module.testKcfa3 =
   function ()
   {
     var src = read("test/resources/kcfa3.scm");
     var cesk = createCesk()
     var actual = run(src, cesk);
     var expected = SetValue.from1(cesk.l.FALSE); // #f
     assertEquals(expected, actual);
   }   
   
 module.testMj09 =
   function ()
   {
     var src = read("test/resources/mj09.scm");
     var cesk = createCesk()
     var actual = run(src, cesk);
     var expected = SetValue.from1(cesk.l.NUMBER); // 2
     assertEquals(expected, actual);
   }   
   
  module.testRotate =
    function ()
    {
      var src = read("test/resources/rotate.scm");
      var cesk = createCesk();
      var actual = run(src, cesk);
      var expected = SetValue.from([cesk.l.abst1(5), cesk.l.abst1(true), cesk.l.abst1("hallo")]);
      assertEquals(expected, actual);
    }
          
  return module;

})()


