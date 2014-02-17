function FrameStackSummary(frames)
{
  this._frames = frames;
}

FrameStackSummary.empty =
  function ()
  {
    return new FrameStackSummary(ArraySet.empty());
  }

FrameStackSummary.prototype.toString =
  function ()
  {
    return this._frames.toString();
  }

FrameStackSummary.prototype.equals =
  function (x)
  {
    return (x instanceof FrameStackSummary)
      && this._frames.equals(x._frames)
  }

FrameStackSummary.prototype.subsumes =
  function (x)
  {
    return (x instanceof FrameStackSummary)
      && this._frames.subsumes(x._frames)
  }

FrameStackSummary.prototype.hashCode =
  function ()
  {
    var prime = 43;
    var result = 1;
    result = prime * result + this._frames.hashCode();
    return result;    
  }

FrameStackSummary.prototype.push =
  function (frame)
  {
    var frames = this._frames.add(frame);
    return new FrameStackSummary(frames);
  }

FrameStackSummary.prototype.addresses =
  function ()
  {
    return this._frames.values().flatMap(function (frame) {return frame.addresses()});
  }
