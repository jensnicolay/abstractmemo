var Eq =
  {
    equals:function (x, y)
    {
      if (Object.is(x,y))
      {
        return true;
      }
      if (x === undefined || y === undefined || x === null || y === null)
      {
        return false;
      }
//      if (!x.equals)
//      {
//        throw new Error("argh: " + x);
//        return false;
//      }
      return x.equals(y);
    }
  }

Eq.checker =
  function (x)
  {
    return function (y) { return Eq.equals(x,y); }; 
  };  
  
var HashCode = {};
HashCode.hashCode =
  function (x)
  {
    if (x === undefined || x === null)
    {
      return 0; 
    }
    if (!x.hashCode) {
      print(x, x.constructor)
      };
    return x.hashCode();
  }
  
var Visitor = {};
Visitor.accept = function (visitor) {return function (x) {return x.accept ? x.accept(visitor) : String(x)}};
  
Boolean.prototype.equals =
  function (x)
  {
    return this.valueOf() === x.valueOf();
  };
  
Boolean.prototype.hashCode =
  function ()
  {
    return this.valueOf() ? 1231 : 1237;
  }

Number.prototype.equals =
  function (x)
  {
    return this.valueOf() === x; 
  };
  
Number.prototype.hashCode =
  function ()
  {
    return this.valueOf();
  }
  
Array.prototype.toString =
  function ()
  {
    // return "[" + this.join(",") + "]"; doesn't work for [undefined]
    if (this.length === 0)
    {
      return "[]";
    }
    var s = "[";
    for (var i = 0; i < this.length - 1; i++)
    {
      s += this[i] + ","; 
    }
    s += this[i] + "]";
    return s;   
  };

Array.prototype.memberAt =
  function (x)
  {
    for (var i = 0; i < this.length; i++)
    {
      var el = this[i];
      if (Eq.equals(x, el))
      {
        return i;
      }
    }
    return -1;
  };

Array.prototype.flatten =
  function ()
  {
    return this.reduce(function (p, c) {return p.concat(c)}, []);
  };

Array.prototype.flatMap =
  function (f, th)
  {
    return this.map(f, th).flatten();
  };
  
Array.prototype.addFirst =
  function (x)
  {
    return [x].concat(this);
  };    

Array.prototype.addLast =
  function (x)
  {
    if (Array.isArray(x))
    {
      return this.concat([x]);
    }
    return this.concat(x);
  };    
  
Array.prototype.addUniqueLast =
  function (x)
  {
    if (this.memberAt(x) > -1)
    {
      return this;
    }
    return this.addLast(x);
  };
  
Array.prototype.remove =
  function (x)
  {
    var i = this.memberAt(x);
    if (i === -1)
    {
      return this.slice(0);
    }
    return this.slice(0, i).concat(this.slice(i+1));
  }
  
Array.prototype.removeAll =
  function (xs)
  {
    return this.flatMap(
      function (el)
      {
        if (xs.memberAt(el) > -1)
        {
          return [];
        }
        return [el];
      });
  }

Array.prototype.keepAll =
  function (xs)
  {
    return this.flatMap(
      function (el)
      {
        if (xs.memberAt(el) === -1)
        {
          return [];
        }
        return [el];
      });
  }

Array.prototype.toSet = 
  function ()
  {
    var result = [];
    for (var i = 0; i < this.length; i++)
    {
      result = result.addUniqueLast(this[i]);
    }
    return result;
  }
  
Array.prototype.equals =
  function (x)
  {
    if (this === x)
    {
      return true;
    }
    if (x === undefined || x === null)
    {
      return false;
    }
    var length = x.length;
    if (this.length != length)
    {
      return false;
    }
    for (var i = 0; i < length; i++)
    {
      var xi = x[i];
      var thisi = this[i];
      if (!Eq.equals(xi, thisi))
      {
        return false;
      }
    }
    return true;
  };
  
Array.prototype.hashCode =
  function()
  {
    var l = this.length;
    if (l === 0)
    {
      return 0;
    }
    var result = 1;
    for (var i = 0; i < l; i++)
    {
      result = (31 * result + HashCode.hashCode(this[i])) >> 0;
    }
    return result;
  }
    
Array.prototype.setHashCode =
  function()
  {
    var l = this.length;
    if (l === 0)
    {
      return 0;
    }
    var result = 1;
    for (var i = 0; i < l; i++)
    {
      result = result ^ HashCode.hashCode(this[i]);
    }
    return result;
  }
      
Array.prototype.subsumes =
  function (xs)
  {
    for (var i = 0; i < xs.length; i++)
    {
      if (this.memberAt(xs[i]) === -1)
      {
        return false;
      }
    }
    return true;
  };
    
Array.prototype.setEquals =
  function (x)
  {
    var length = x.length;
    if (this.length != length)
    {
      return false;
    }
    for (var i = 0; i < length; i++)
    {
      var xi = x[i];
      if (this.memberAt(xi) === -1)
      {
        return false;
      }
    }
    return true;
  }

Array.prototype.addEntry =
  function (key, value)
  {
    return this.addFirst([key, value]); 
  };
  
Array.prototype.getEntry =
  function (key)
  {
    for (var i = 0; i < this.length; i++)
    {
      var entry = this[i];
      var entryKey = entry[0];
      if (Eq.equals(key, entryKey))
      {
        return entry;
      }
    }
    return false;
  }

Array.prototype.getValue =
  function (key)
  {
    return this.getEntry(key)[1];
  }

Array.prototype.updateEntry =
  function (key, value)
  {
    for (var i = 0; i < this.length; i++)
    {
      var entry = this[i];
      var entryKey = entry[0];
      if (Eq.equals(entryKey, key))
      {
        return this.slice(0, i).concat([[entryKey, value]]).concat(this.slice(i + 1));
      }
    }
    return this.concat([[key, value]]);
  };
  
Array.prototype.entryKeys =
  function ()
  {
    return this.map(
      function (entry)
      {
        return entry[0];
      });
  } 
  
Array.prototype.entryValues =
  function ()
  {
    return this.map(
      function (entry)
      {
        return entry[1];
      });
  } 

Array.prototype.getSetEntry =
  function (key)
  {
    var entry = this.getEntry(key);
    if (entry)
    {
      return entry[1];
    }
    return [];
  } 
  
Array.prototype.updateSetEntry =
  function (key, value)
  {
    for (var i = 0; i < this.length; i++)
    {
      var entry = this[i];
      var entryKey = entry[0];
      if (Eq.equals(entryKey, key))
      {
        return this.slice(0, i).concat([[key, entry[1].addUniqueLast(value)]]).concat(this.slice(i + 1));
      }
    }
    return this.concat([[key, [value]]]);
  };
  
var Arrays = {};
  
Arrays.indexOf =
  function (x, arr, eq)
  {
    for (var i = 0; i < arr.length; i++)
    {
      if (eq(x, arr[i]))
      {
        return i;
      }
    }
    return -1;
  }

Arrays.removeFirst =
  function (x, arr, eq)
  {
    var index = Arrays.indexOf(x, arr, eq);
    if (index === -1)
    {
      return arr;
    }
    return Arrays.removeIndex(index);
  }

Arrays.removeIndex =
  function (index, arr)
  {
    return arr.slice(0, index).concat(arr.slice(index + 1));
  }

Arrays.remove =
  function (x, arr, eq)
  {
    return arr.filter(function (y) {return !eq(y, x)});
  }

Arrays.removeAll =
  function (xs, arr, eq)
  {
    return xs.reduce(function (arr, x) {return Arrays.remove(x, arr, Eq.equals)}, arr);
  }


Arrays.contains =
  function (x, arr, eq)
  {
    return Arrays.indexOf(x, arr, eq) > -1;
  }

/**
 * Returns new array.
 */
Arrays.member =
  function (x, arr, eq)
  {
    return arr.slice(Arrays.indexOf(x, arr, eq));
  }

/**
 * O(n^2)
 */
Arrays.deleteDuplicates =
  function (arr, eq)
  {
    return arr.reduce(
      function (acc, x)
      {
        return Arrays.indexOf(x, acc, eq) === -1 ? acc.concat([x]) : acc; 
      }, []);
  }

Arrays.union =
  function (arr1, arr2, eq)
  {
    return Arrays.deleteDuplicates(arr1.concat(arr2), eq);
  }

// subset of 2 distinct elements of arr
Arrays.twoCombinations =
  function (arr)
  {
    var result = [];
    for (var i = 0; i < arr.length - 1; i++)
    {
      for (var j = i + 1; j < arr.length; j++)
      {
        result.push([arr[i], arr[j]]);
      }
    }
    return result;
  }

Arrays.cartesianProduct =
  function (arr)
  {
    if (arr.length === 0)
    {
      return [];
    }
    if (arr.length === 1)
    {
       return arr[0].map(
        function (x)
        {
          return [x];
        });
    }
    var rest = Arrays.cartesianProduct(arr.slice(1));
    return arr[0].flatMap(
      function (x)
      {
        return rest.map(
          function (y) 
          { 
            return y.addFirst(x);
          });
      });
  };


Arrays.keys =
  function (arr)
  {
    return arr.map(function (x) {return x[0]});
  }

Arrays.values =
  function (key, arr, eq)
  {
    return arr.reduce(function (acc, x) {return eq(x[0], key) ? acc.concat([x[1]]) : acc});
  }

String.prototype.startsWith =
  function (s)
  {
    return this.lastIndexOf(s, 0) === 0;
  };
  
String.prototype.endsWith = 
  function (s)
  {
    return this.indexOf(s, this.length - s.length) !== -1;
  };
  
String.prototype.equals =
  function (x)
  {
    return this.localeCompare(x) === 0; 
  };
  
String.prototype.hashCode =
  function()
  {
    var l = this.length;
    if (l === 0)
    {
      return 0;
    }
    var result = 1;
    for (var i = 0; i < l; i++)
    {
      result = (31 * result + this.charCodeAt(i)) >> 0;
    }
    return result;
  }

var Character = {};

Character.isWhitespace =
  function (x)
  {
    return x === " " || x === "\n" || x === "\t" || x === "\r";
  }
  
Character.isDigit =
  function (x)
  {
    return x === "0" || x === "1" || x === "2" || x === "3" || x === "4" || x === "5" || x === "6" || x === "7" || x === "8" || x === "9";
  }
  
Function.prototype.toString =
  function ()
  {
    return this.name + "()";
  };    
  
// debug
function d(value) { print(Array.prototype.slice.call(arguments)); return value; }
function dreadline() { var str = readline(); if (str === ":b") { throw new Error(":b"); }}

// assertions
function assertEquals(expected, actual, msg)
{
  if (expected === undefined && actual === undefined)
  {
    return;
  }
  if (expected !== undefined && (expected === actual || (expected.equals && expected.equals(actual))))
  {
    return;
  }
  throw new Error(msg || "assertEquals: expected " + expected + ", got " + actual);
}

function assertSetEquals(expected, actual)
{
  if (expected.toSet().setEquals(actual.toSet()))
  {
    return;
  }
  throw new Error("assertSetEquals: expected " + expected + ", got " + actual + "\ndiff " + expected.removeAll(actual) + "\n     " + actual.removeAll(expected)); 
}

function assertNotEquals(expected, actual)
{
  if (expected !== actual && !expected.equals(actual))
  {
    return;
  }
  throw new Error("assertNotEquals: not expected " + expected + ", got " + actual);
}

function assertTrue(actual, msg)
{
  if (actual === true)
  {
    return;
  }
  throw new Error(msg || "assertTrue: got " + actual);
}

function assertFalse(actual)
{
  if (actual === false)
  {
    return;
  }
  throw new Error("assertFalse: got " + actual);
}

function assertNaN(actual)
{
  if (isNaN(actual))
  {
    return;
  }
  throw new Error("assertNaN: got " + actual);
}

function assertDefinedNotNull(actual, msg)
{
  if (actual === undefined || actual === null)
  {
    throw new Error(msg || "assertDefinedNotNull: got " + actual);
  }
}


// ECMA
var Ecma = { POW_2_31 : Math.pow(2,31), POW_2_32 : Math.pow(2,32)};

// 5.2 (not included here are equivalent Math.* functions)
Ecma.sign =
  function (x)
  {
    // per 5.2: "sign is never used in standard for x = 0"
    return (x < 0 ? -1 : 1);
  };

// 8.6.2
Ecma.Class =
  {
    OBJECT: "Object", 
    FUNCTION: "Function", 
    ARRAY: "Array", 
    ARGUMENTS: "Arguments", 
    STRING: "String", 
    BOOLEAN: "Boolean", 
    NUMBER: "Number",
    MATH: "Math",
    DATE: "Date",
    REGEXP: "RegExp",
    ERROR: "Error",
    JSON: "JSON"
  };

var Collections = {};

Collections.add =
  function (collection, value)
  {
    return collection.add(value);
  }

Collections.addAll =
  function (collection, values)
  {
    return collection.addAll(values);
  }

Collections.size =
  function (collection)
  {
    return collection.size();
  }

Collections.values =
  function (collection)
  {
    return collection.values();
  }

/*
 * Map interface
 * 
 * equals/hashCode TODO
 * put
 * get
 * entries
 * keys
 * values
 * size
 * clear
 *  
 */

function Map()
{
}

Map.prototype.subsumes =
  function (x)
  {
    if (this === x)
    {
      return true;
    }
    if (this.size() < x.size())
    {
      return false;
    }
    return x.iterateEntries(
      function (entry)
      {
        var value = this.get(entry.key);
        return value !== undefined && value.subsumes(entry.value);
      }, this);
  }

Map.prototype.compareTo =
  function (x)
  {
    var s1 = this.subsumes(x);
    var s2 = x.subsumes(this);
    return s1 ? (s2 ? 0 : 1) : (s2 ? -1 : undefined);
  }

Map.prototype.equals =
  function (x)
  {
    if (this === x)
    {
      return true;
    }
    if (this.size() !== x.size())
    {
      return false;
    }
    return this.iterateEntries(
        function (entry)
        {
          var xValue = x.get(entry.key);
          return xValue !== undefined && entry.value.equals(xValue);
        }, this);
  }

Map.prototype.hashCode =
  function ()
  {
    var entries = this.entries();
    var result = 1;
    for (var i = 0; i < entries.length; i++)
    {
      var entry = entries[i];
      result = (result + (31 * HashCode.hashCode(entry.key) ^ HashCode.hashCode(entry.value))) >> 0;
    }
    return result;
  }

Map.prototype.putAll =
  function (map)
  {
    return map.entries().reduce(function (result, entry) {return result.put(entry.key, entry.value)}, this);
  }

Map.prototype.join =
  function (map, bot)
  {
    return this.joinWith(map, function (x, y) {return x.join(y)}, bot);
  }

Map.prototype.joinWith =
  function (x, join, bot)
  {
    var that = this;
    return x.entries().reduce(
      function (result, entry)
      {
        var key = entry.key;
        var thisValue = that.get(key, bot);
        var xValue = entry.value;
        var value = join(thisValue, xValue);
        return result.put(key, value);
      }, this);
  }

Map.prototype.removeAll =
  function (keys)
  {
    return keys.reduce(function (result, key) {return result.remove(key)}, this);
  }

function ArrayMap(arr)
{
  this._arr = arr
}
ArrayMap.prototype = Object.create(Map.prototype);
ArrayMap.empty =
  function ()
  {
    return new ArrayMap([]);
  }
ArrayMap.from =
  function (arr)
  {
    return new ArrayMap(arr);
  }
ArrayMap.prototype.put =
  function (key, value)
  {
    var arr = this._arr;
    for (var i = 0; i < arr.length; i++)
    {
      var entry = arr[i];
      if (Eq.equals(entry.key, key))
      {
        if (Eq.equals(entry.value, value))
        {
          return this;
        }
        return new ArrayMap(Arrays.removeIndex(i, arr).addLast({key:key,value:value}));
      }
    }
    return new ArrayMap(arr.addLast({key:key,value:value}));  
  }

ArrayMap.prototype.get =
  function (key, bot)
  {
    var arr = this._arr;
    for (var i = 0; i < arr.length; i++)
    {
      var entry = arr[i];
      if (Eq.equals(entry.key, key))
      {
        return entry.value;
      }
    }
    return bot;
  }

ArrayMap.prototype.entries =
  function ()
  {
    return this._arr.slice(0);
  }

ArrayMap.prototype.iterateEntries =
  function (f, th)
  {
    var arr = this._arr;
    for (var i = 0; i < arr.length; i++)
    {
      if (f.call(th, arr[i]) === false)
      {
        return false;
      }
    }
    return true;
  }

ArrayMap.prototype.keys =
  function ()
  {
    return this._arr.map(function (entry) {return entry.key});
  }

ArrayMap.prototype.values =
  function ()
  {
    return this._arr.map(function (entry) {return entry.value});
  }

ArrayMap.prototype.size =
  function ()
  {
    return this._arr.length;
  }

ArrayMap.prototype.clear =
  function ()
  {
    return new ArrayMap([]);
  }

ArrayMap.prototype.toString =
  function ()
  {
    return this._arr.map(function (entry) {return entry.key + " -> " + entry.value}).toString();
  }

ArrayMap.prototype.nice =
  function ()
  {
    return this._arr.map(function (entry) {return entry.key + " -> " + entry.value}).join("\n");
  }

function HashMap(entries)
{
  this._entries = entries;
}
HashMap.prototype = Object.create(Map.prototype);

HashMap.empty =
  function (size)
  {
    var entries = new Array(size || 31);
    entries.size = 0;
    return new HashMap(entries);
  }

HashMap.from =
  function (arr)
  {
    return arr.reduce(function (result, entry) {return result.put(entry.key, entry.value)}, HashMap.empty());
  }

HashMap.prototype.put =
  function (key, value)
  {
    var keyHash = key.hashCode();
    var hash = (keyHash >>> 0) % this._entries.length;
    var buckets = this._entries[hash];
    if (!buckets)
    {
      var newBuckets = [{key:key, value:value}];
    }
    else
    {
      for (var i = 0; i < buckets.length; i++)
      {
        var bucket = buckets[i];
        if (Eq.equals(key, bucket.key))
        {
          var newBuckets = buckets.slice(0);
          newBuckets[i] = {key:key, value:value};
          var newEntries = this._entries.slice(0);
          newEntries[hash] = newBuckets;
          newEntries.size = this.size(); 
          return new HashMap(newEntries);      
        }
      }
      var newBuckets = buckets.slice(0);
      newBuckets[i] = {key:key, value:value};      
    }
    var newEntries = this._entries.slice(0);
    newEntries[hash] = newBuckets;
    newEntries.size = this.size() + 1;
    return new HashMap(newEntries);      
  }

HashMap.prototype.get =
  function (key, bot)
  {
    var keyHash = key.hashCode();
    var hash = (keyHash >>> 0) % this._entries.length;
    var buckets = this._entries[hash];    
    if (!buckets)
    {
      return bot;
    }
    for (var i = 0; i < buckets.length; i++)
    {
      var bucket = buckets[i];
      if (Eq.equals(key, bucket.key))
      {
        return bucket.value;
      }
    }
    return bot;
  }

HashMap.prototype.remove =
  function (key)
  {
    var keyHash = key.hashCode();
    var hash = (keyHash >>> 0) % this._entries.length;
    var buckets = this._entries[hash];
    if (!buckets)
    {
      return this;
    }
    for (var i = 0; i < buckets.length; i++)
    {
      var bucket = buckets[i];
      if (Eq.equals(key, bucket.key))
      {
        var newBuckets = buckets.slice(0, i).concat(buckets.slice(i + 1));
        var newEntries = this._entries.slice(0);
        newEntries[hash] = newBuckets;
        newEntries.size = this.size() - 1; 
        return new HashMap(newEntries);
      }
    }
    return this;        
  }

HashMap.prototype.entries =
  function ()
  {
    return this._entries.flatten();
  }

HashMap.prototype.iterateEntries =
  function (f, th)
  {
    var buckets = this._entries;
    for (var i = 0; i < buckets.length; i++)
    {
      var bucket = buckets[i];
      if (bucket)
      {
        for (var j = 0; j < bucket.length; j++)
        {
          if (f.call(th, bucket[j]) === false)
          {
            return false;
          }
        }        
      }
    }
    return true;
  }

HashMap.prototype.keys =
  function ()
  {
    return this._entries.flatten().map(function (bucket) {return bucket.key});
  }

HashMap.prototype.values =
  function ()
  {
    return this._entries.flatten().map(function (bucket) {return bucket.value});
  }

HashMap.prototype.size =
  function ()
  {
    return this._entries.size;
  }

HashMap.prototype.clear =
  function ()
  {
    var entries = new Array(this._entries.length);
    entries.size = 0;
    return new HashMap(entries);
  }

HashMap.prototype.toString =
  function ()
  {
    return this.entries().map(function (entry) {return entry.key + " -> " + entry.value}).toString();
  }

HashMap.prototype.nice =
  function ()
  {
    return this.entries().map(function (entry) {return entry.key + " -> " + entry.value}).join("\n");
  }

/*
 * Set interface
 * 
 * equals, hashCode (based on values)
 * add
 * addAll
 * contains
 * values
 * size
 *  
 */
function Set()
{
}

Set.prototype.subsumes =
  function (x)
  {
    if (this === x)
    {
      return true;
    }
    if (this.size() < x.size())
    {
      return false;
    }
    var xValues = x.values();
    for (var i = 0; i < xValues.length; i++)
    {
      if (!this.contains(xValues[i]))
      {
        return false;
      }
    }
    return true;
  }

Set.prototype.equals =
  function (x)
  {
    if (this === x)
    {
      return true;
    }
    if (this.size() !== x.size())
    {
      return false;
    }
    var values = this.values();
    for (var i = 0; i < values.length; i++)
    {
      if (!x.contains(values[i]))
      {
        return false;
      }
    }
    return true;
  }

Set.prototype.hashCode =
  function ()
  {
    return this.values().setHashCode();
  }

Set.prototype.compareTo =
  function (x)
  {
    var s1 = this.subsumes(x);
    var s2 = x.subsumes(this);
    return s1 ? (s2 ? 0 : 1) : (s2 ? -1 : undefined);
  }

Set.prototype.join =
  function (x)
  {
    return x.values().reduce(function (result, value) {return result.add(value)}, this);
  } 

Set.prototype.meet =
  function (x)
  {
    return this.values().reduce(function (result, value) {return x.contains(value) ? result.add(value) : result}, this.clear());
  } 

Set.prototype.subtract =
  function (x)
  {
    return this.values().reduce(function (result, value) {return x.contains(value) ? result : result.add(value)}, this.clear());
  } 

function HashSet(map)
{
  this._map = map;
}
HashSet.prototype = Object.create(Set.prototype);

HashSet.empty =
  function (size)
  {
    return new HashSet(HashMap.empty(size));
  }

HashSet.from =
  function (arr)
  {
    return arr.reduce(function (result, x) {return result.add(x)}, HashSet.empty());
  }

HashSet.prototype.clear =
  function ()
  {
    return new HashSet(this._map.clear());
  }

HashSet.prototype.add =
  function (value)
  {
    var existing = this._map.get(value);
    if (existing === undefined)
    {
      return new HashSet(this._map.put(value, value));
    }
    return this;
  }

HashSet.prototype.addAll =
  function (values)
  {
    return values.reduce(Collections.add, this);
  }

HashSet.prototype.remove =
  function (value)
  {
    return new HashSet(this._map.remove(value));
  }

HashSet.prototype.removeAll =
  function (values)
  {
    return new HashSet(this._map.removeAll(values));
  }

HashSet.prototype.contains =
  function (value)
  {
    var existing = this._map.get(value);
    return existing !== undefined;
  }

HashSet.prototype.filter =
  function (f, ths)
  {
    return HashSet.from(this.values().filter(f, ths));
  }

HashSet.prototype.values =
  function ()
  {
    return this._map.values();
  }

HashSet.prototype.size =
  function ()
  {
    return this._map.size();
  }

HashSet.prototype.toString =
  function ()
  {
    return this._map.values().toString();
  }

HashSet.prototype.nice =
  function ()
  {
    return this.toString();
  }

function CombineSet(s1, s2)
{
  assertEquals(s1, s2);
  assertEquals(s1.hashCode(), s2.hashCode());
  this._s1 = s1;
  this._s2 = s2;
}
CombineSet.prototype = Object.create(Set.prototype);

CombineSet.prototype.clear =
  function ()
  {
    return new CombineSet(this._s1.clear(), this._s2.clear());
  }

CombineSet.prototype.add =
  function (value)
  {
    var s1 = this._s1.add(value);
    var s2 = this._s2.add(value);
    return new CombineSet(s1, s2);
  }

CombineSet.prototype.addAll =
  function (values)
  {
    var s1 = this._s1.addAll(values);
    var s2 = this._s2.addAll(values);
    return new CombineSet(s1, s2);
  }

CombineSet.prototype.remove =
  function (value)
  {
    var s1 = this._s1.remove(value);
    var s2 = this._s2.remove(value);
    return new CombineSet(s1, s2);
  }

CombineSet.prototype.removeAll =
  function (values)
  {
    var s1 = this._s1.removeAll(values);
    var s2 = this._s2.removeAll(values);
    return new CombineSet(s1, s2);
  }

CombineSet.prototype.contains =
  function (value)
  {
    var s1 = this._s1.contains(value);
    var s2 = this._s2.contains(value);
    assertEquals(s1, s2);
    return s1;
  }

CombineSet.prototype.filter =
  function (f, ths)
  {
    var s1 = this._s1.filter(f, ths);
    var s2 = this._s2.filter(f, ths);
    return new CombineSet(s1, s2);
  }

CombineSet.prototype.values =
  function ()
  {
    var s1 = this._s1.values();
    var s2 = this._s2.values();
    assertSetEquals(s1, s2);
    return s1;
  }

CombineSet.prototype.size =
  function ()
  {
    var s1 = this._s1.size();
    var s2 = this._s2.size();
    assertEquals(s1, s2);
    return s1;
  }

CombineSet.prototype.toString =
  function ()
  {
    return this._s1.toString();
  }

CombineSet.prototype.nice =
  function ()
  {
    return this._s1.toString();
  }

CombineSet.prototype.equals =
  function (x)
  {
    var s1 = this._s1.equals(x);
    var s2 = this._s2.equals(x);
    assertEquals(s1, s2);
    return s1;
  }

CombineSet.prototype.hashCode =
  function ()
  {
    var s1 = this._s1.hashCode();
    var s2 = this._s2.hashCode();
    assertEquals(s1, s2);
    return s1;
  }

CombineSet.prototype.join =
  function (x)
  {
    var s1 = this._s1.join(x);
    var s2 = this._s2.join(x);
    return new CombineSet(s1, s2);
  } 

CombineSet.prototype.meet =
  function (x)
  {
    var s1 = this._s1.meet(x);
    var s2 = this._s2.meet(x);
    return new CombineSet(s1, s2);
  } 

CombineSet.prototype.subtract =
  function (x)
  {
    var s1 = this._s1.subtract(x);
    var s2 = this._s2.subtract(x);
    return new CombineSet(s1, s2);
  } 


function ArraySet(arr)
{
  this._arr = arr;
}
ArraySet.prototype = Object.create(Set.prototype);

ArraySet.empty =
  function ()
  {
    return new ArraySet([]);
  }
ArraySet.from =
  function (arr)
  {
    return new ArraySet(Arrays.deleteDuplicates(arr, Eq.equals));
  }

ArraySet.from1 =
  function (x)
  {
    return new ArraySet([x]);
  }

ArraySet.prototype.clear =
  function ()
  {
    return new ArraySet([]);
  }


ArraySet.prototype.add =
  function (value)
  {
    var index = Arrays.indexOf(value, this._arr, Eq.equals);
    if (index > -1)
    {
      return this;
    }
    return new ArraySet(this._arr.concat([value]));
  }

ArraySet.prototype.addAll =
  function (values)
  {
    return values.reduce(Collections.add, this);
  }

ArraySet.prototype.remove =
  function (value)
  {
    return new ArraySet(Arrays.removeFirst(value, this._arr, Eq.equals));
  }

ArraySet.prototype.removeAll =
  function (values)
  {
    return new ArraySet(values.reduce(function (arr, value) {return Arrays.removeFirst(value, arr, Eq.equals)}, this._arr));
  }

ArraySet.prototype.contains =
  function (value)
  {
    var index = Arrays.indexOf(value, this._arr, Eq.equals);
    return index > -1;
  }

ArraySet.prototype.filter =
  function (f, ths)
  {
    return new ArraySet(this._arr.filter(f, ths));
  }

ArraySet.prototype.values =
  function ()
  {
    return this._arr.slice(0);
  }

ArraySet.prototype.mapValues =
  function (f, th)
  {
    return this._arr.map(f, th);
  }

ArraySet.prototype.size =
  function ()
  {
    return this._arr.length;
  }

ArraySet.prototype.toString =
  function ()
  {
    return this._arr.toString();
  }

ArraySet.prototype.nice =
  function ()
  {
    return this.toString();
  }
