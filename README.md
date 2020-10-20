# Nymph

*Nymph* is a patch engine for (serialized) typed object **database** in JSON format.

This engine is originally developed for an extendable mod system.

Nymph is highly inspired by the mod system of `The Elder Scrolls`('s disadvantages) and other games. Aims to keep the plugin flexibility and maximum compatibility between plugins.

Although a plugin always contains many entries, the documentation assumes each json contains only one entry/object.

## Basic Design

### Plugin

A plugin contains many objects. All these objects construct the object database.

An object must have a `plugin group`-wide unique field to identity objects. In this document, it's `$id`.

If an object's id already presented in the database, it will be a patch. 

A patch object must contain an `operator`. By default, it's `merge` and `append`.

If a plugin wants to edit some objects, it should know everything about the original plugins which define those objects.

A plugin shouldn't contain anything it doesn't need.

### Master File

A plugin needs add `Master` (dependency) to their definition to make reference works properly.

Example in this documentation doesn't contain this part.

A plugin and master plugins it depends on call `plugin group`.

### Type

- Number
- String
- Boolean
- List/Array
- Object

### Reference String

Single Reference:

- `obj-id#path.to.the.key`: select key path "path.to.the.key" from `obj-id` object

List Reference (Only for arrays):

- `obj-id#path.to.arr/0`: select from array key path "path.to.arr", index 0

- `obj-id#path.to.the.key/0-10`: select from index 0 to 10

- `obj-id#path.to.the.key/!4`: except index 4. This can be applied to other range reference

- `obj-id#path.to.the.key/1,2,4-10`: index 1, 2, 4 to 10

Won't support reverse index:

Nymph aims to be a simple object database patch tool, which means the patch should know everything it wants to change.

- `obj-id#path.to.arr/-`: select from array key path "path.to.arr", last element - won't support

- `obj-id#path.to.arr/-1`: same as `-` - won't support

- `obj-id#path.to.arr/-N`: select N-th element from last - won't support

## Non-List Operator

### `$import` (WIP)

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

The `$import` can also combine with `$strategy`.

If `$import-pick` occurs, only given path properties will be selected.

If `$import-no-pick` occurs, given path properties won't be selected. `$import-pick` has higher priority.

If `$import-map` occurs, it has higher priority. 

If common properties occurs, they have higher priority.

If properties definition also occurs in same level, they have higher priority.

<details>
<summary>Example</summary>

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
        "$keep": [
            "key"
        ],
        "$import": "t2#obj",
        "$strategy": "merge",

        "$keep-ref": {
            "key": "t3#obj.key",
        },
        "$import-map": {
            "key": "t3#obj.key"
        },
//      "key": { // "Expand" primitive field to a object perhaps is a bad idea 
//          "$keep-ref": "t3#obj.key",
//          "$value": "t3#obj.key"
//      }
    }
}

const result = {
    "obj": {
        "$keep": [
            "key"
        ],
        "key": {
            "$keep-ref": "t3#obj.key",
            "$value": "want-val",
        },
        "another-key": "val"
    }
}
```
</details>

#### `$import-pick` (WIP)

Type: `List<RelativeReference>`

Defines which property `$import` should pick.

#### `$import-no-pick` (WIP)

Type: `List<RelativeReference>`

Defines which property `$import` should not pick.

#### `$import-map` (WIP)

Type: `Map<KeyName, Reference>`

### `$strategy`

Type: `Enum`.

`$strategy` points how object merge works.

Available values:
- merge (default): will add all new properties and replace all existed properties to object. Unlisted properties keep unchanged.
- replace: Replace whole object. This doesn't control the list property.
- replace-exist: adds nothing, only replaces all existed properties to object.
- add-new: replaces nothing, only adds all new properties to object.

`$strategy` doesn't control list. List strategy is special, see `$list-strategy`.

### `$remove`

Type: `List<String>`.

`$remove` contains a name list of property which should be removed.

## List Operator

### `$list-strategy`

Only works for `List` property.

Type: `Enum`.

`$list-strategy` points how list merge works.

Available values:
- append (default): doesn't change existed elements
- prepend: use this if order matters
- replace: clear all existed elements in all plugins, has the highest priority.

If a `$list-mutate` operator is set, this property is fallback strategy. 

Specially, if `$list-strategy` is `replace`, it will replace existed list to self regardless, ignores any other operators.

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
    "$list-remove": [
      "/0",
      "0",
      "/0-10", // clear index from 0 to 10
      "0-1", // clear index from 0 to 1
      "!4", // except index 4
    ],
    "$list-remove-match": [
      { // ListMatcher
        "$find-strategy": "first",
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

Type: `List<ListMutatePatch>`.

Controls elements insert or replace explicitly. Not listed elements follows the `$list-strategy` operator.

## Flag Operator

Flag operators add flags to properties.

All available flags:

- `$keep`: Indicates property shouldn't be removed.
- `$keep-ref`: Indicates property value should exactly same as a reference.

Flags won't change any operator behavior, it only raises warnings if violates flag semantics.

### `$keep`

Type: `List<KeyName>`.

`$keep` operator also is a *flag*.

Property has `$keep` flag indicates that the plugin requires its existence to work properly and shouldn't be removed by other plugins.

Note that `$keep` flag won't reject `$remove` or `$strategy=replace` operator, only raise warnings if violated.

Available values:
- exist (default): This flag warning if any plugin wants to remove this property.
- none: Use `remove`.
- ref: Meaningless. See [`$keep-ref`](#keep-ref). If `ref` is set, a `$keep-ref` operator must be set, too.

#### `$keep-ref`

Type: `Map<KeyName, Reference>`.

This flag indicates the final value of this property should be same as the given reference.

### `$list-keep` (WIP)

This adds `$keep` flag to the matched elements.

Note that `$keep` flag won't reject `$list-mutate` or `$list-strategy=replace` operator, only raise warnings if violated.

### `$list-keep-ref` (WIP)
