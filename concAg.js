function createConcTagAg()
{
  var a = {};
  a.toString = function () {return "concTagAg"};
  var count = 0;
  
  a.variable =
    function (node, time)
    {
      return new MonoAddr(node.tag + "-" + count++);
    }
  
  return a;
}
