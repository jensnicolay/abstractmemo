function MemoTable(map)
{
  this._map = map;
}

MemoTable.empty =
  function ()
  {
    return new MemoTable(HashMap.empty());
  }

MemoTable.prototype.put =
  function (lam, rands, store, value)
  {
    var map = this._map.put(lam.tag, this._map.get(lam.tag, ArraySet.empty()).add([rands, store, value]));
    return new MemoTable(map);
  }

MemoTable.prototype.get =
  function (lam, rands, store)
  {
    var entries = this._map.get(lam.tag, ArraySet.empty()).values();
    var memoValue = BOT;
    var memoStore = BOT;
    for (var j = 0; j < entries.length; j++)
    {
      var entry = entries[j];
      var mRands = entry[0];
      for (var k = 0; k < mRands.length; k++)
      {
        if (!mRands[k].subsumes(rands[k]))
        {
          continue;
        }
      }
      var mStore = entry[1];
      if (mStore.subsumes(store))
      {
        var mValue = entry[2];
        memoValue = memoValue.join(mValue);
        memoStore = memoStore.join(mStore);
//        return [mStore, mValue];
      }
    }
    return [memoStore, memoValue];
  }