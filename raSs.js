function RaStackSummary(addresses)
{
  this._addresses = addresses;
}

RaStackSummary.empty =
  function ()
  {
    return new RaStackSummary(ArraySet.empty());
  }

RaStackSummary.prototype.toString =
  function ()
  {
    return this._addresses.toString();
  }

RaStackSummary.prototype.equals =
  function (x)
  {
    return (x instanceof RaStackSummary)
      && this._addresses.equals(x._addresses)
  }

RaStackSummary.prototype.subsumes =
  function (x)
  {
    return (x instanceof RaStackSummary)
      && this._addresses.subsumes(x._addresses)
  }

RaStackSummary.prototype.hashCode =
  function ()
  {
    var prime = 43;
    var result = 1;
    result = prime * result + this._addresses.hashCode();
    return result;    
  }

RaStackSummary.prototype.push =
  function (frame)
  {
    var addresses = this._addresses.addAll(frame.addresses());
    return new RaStackSummary(addresses);
  }

RaStackSummary.prototype.addresses =
  function ()
  {
    return this._addresses.values();
  }
