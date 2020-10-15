# Nymph

*Nymph* is a patch engine for (serialized) typed object **database** in JSON format.

This engine is originally developed for an extendable mod system. Each `json` file considered as a *plugin*.

Nymph is highly inspired by the mod system of `The Elder Scrolls`('s disadvantages) and other games. Aims to keep the plugin flexibility and maximum compatibility between plugins.

Although a plugin always contains many entries, the documentation assumes each json contains only one entry/object.

## Basic Design

A patched property must contain an `operator`.

A object must have a plugin-wide unique field to identity objects. In this document, it's `$id`.

### Master File

A plugin needs add `Master` to their definition to make reference works properly.

Example in this documentation won't show this while the example only contains object.

### Reference String

Single Reference:

- `obj-id#path.to.the.key`: select key path "path.to.the.key" from `obj-id` object

- `obj-id#path.to.arr/0`: select from array key path "path.to.arr", index 0

- `obj-id#path.to.arr/-`: select from array key path "path.to.arr", last element

- `obj-id#path.to.arr/-1`: same as `-`

- `obj-id#path.to.arr/-N`: select N-th element from last 

List Reference (Only for arrays):

- `obj-id#path.to.the.key/0..10`: select from index 0 to 10

- `obj-id#path.to.the.key/!4`: except index 4. This can be applied to other range reference

- `obj-id#path.to.the.key/1,2,4..10`: index 1, 2, 4 to 10

## Non-List Operator

### `$import`

Type: `Reference`.

`$import` generates an object by reference.

<details>
<summary>Example</summary>

```javascript
// a.json
const a = {
  "$id": "obj-a",
  "a": {
    "prop": "property A"
  },
  "foo": "bar"
}
```

```javascript
// b.json
const b = {
  "$id": "obj-b",
  "b": {
    "prop": "property B"
  },
  "arr": [
    {
      "prop": "property in arr"
    }
  ]
}
```

```javascript
// c.json
const c = {
  "$id": "obj-a",
  "a": {
    "$import": "obj-b#/b", // typically json reference format is `b.json#/xxx`, but we use `$id` here.
  },
  "b": {
    "$import": "obj-b#/arr/0"
  }
}
```

In this situation, `a.json` and `b.json` are plugins predefined in system. `c.json` is the plugin newly added.

The `$id` of `c.json` is same as `a.json`, means `c.json` wants to change something in `a.json`.

```javascript
// result
const result = {
  "$id": "obj-a",
  "a": {
    "prop": "property B",
  },
  "b": {
    "prop": "property in arr"
  },
  "foo": "bar"
}
```
</details>


The `$import` can also combined with `$strategy`.

If `$import-pick` occurs, only given path properties will be selected.

If `$import-no-pick` occurs, given path properties won't be selected. `$import-pick` has higher priority.

If properties definition also occurs in same level, they have higher priority.

```javascript

const t1 = {
    "obj": {
        "key": "val",
    }
}

const t2 = {
    "obj": {
        "key": "another-val",
        "another-key": "val"
    }
}

const t3 = {
    "obj": {
        "key": "want-val",
    }
}

// Now I want to import all keys from `t2#obj` except `key` should be `t3#obj.key`
const patch = {
    "obj": {
        "$import": "t2#obj",
        "key": {
            '$value': "t3#obj.key"
        }
    }
}
```

#### `$import-path`

Type: `List<RelativeReference>`

Defines which paths import should pick.

### `$strategy`

Type: `Enum`.

`$strategy` points how object merge works.

Available values:
- merge (default): will add all new properties and replace all existed properties to object. Unlisted properties keep unchanged.
- replace: Replace whole object. This doesn't control the list property.
- replace-exist: adds nothing, only replaces all existed properties to object.
- add-new: replaces nothing, only adds all new properties to object.

`$strategy` doesn't control list. List strategy is special, see `$strategy-list`.

### `$remove`

Type: `List<String>`.

`$remove` contains a name list of property which should be removed.

## List Operator

### `$strategy-list`

Only works for `List` property.

Type: `Enum`.

`$strategy-list` points how list merge works.

Available values:
- append (default): doesn't change existed elements
- prepend: use this if order matters
- replace: clear all existed elements in all plugins, has the highest priority.

If a `$strategy-list-hybrid` operator is set, this property is fallback strategy. 

Specially, if `$strategy-list` is `replace`, it will replace existed list to self regardless, ignores any other operators.

### `$list-remove`

Only works for `List` property.

Type: `List<Reference | PropertyMatcher>`.

Clear all specific elements in listed values.

<details>
<summary>Example</summary>

```javascript
// c.json
const c = {
  "arr": {
    "$strategy-list-remove": [
      "b.json#/arr",
      "c.json#/arr/0",
      "c.json#/arr/0/10", // clear index from 0 to 10
      "c.json#/arr/0/-1", // clear index from 0 to 10
      "c.json#/arr/!4", // except index 4
      { // PropertyMatcher
        "$found-strategy": "first",
        "$matcher": {
          "name": {
            "$equals": "TargetName",
          }
        }
      }
    ],
    "$value": [
      {
        "prop": "foo",
      }
    ]
  }
}
```

</details>

### `$list-mutate`

Type: `List<HybridListPatch>`.

Controls elements insert or replace explicitly. Not listed elements follows the `$strategy-list` operator.

## Flag Operator

### `$keep`

Type: `Enum`.

`$keep` marks a property is required by this plugin.

Note that `$keep` operator won't reject `$remove` or `$strategy=replace` operator, only raise warnings if violated.

Available values:
- exist (default): This prevents or warning any plugins wants to remove this property.
- ref: Meaningless. See [`$keep-ref`](#keep-ref). If `ref` is set, a `$keep-ref` operator must be set, too.

#### `$keep-ref`

Type: `Reference`.

This mark indicates the final value of this property should be same as the given reference.

### `$list-keep`

This adds `$keep` mark to the matched elements.

Note that `$keep` operator won't reject `$list-mutate` or `$strategy-list=replace` operator, only raise warnings if violated.

### `$list-keep-ref`
