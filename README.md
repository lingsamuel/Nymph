# Nymph

*Nymph* is a patch engine for (serialized) typed object database in JSON form.

This engine is originally developed for a extendable mod system. Each `json` file considered as a *plugin*.

Nymph is highly inspired by the mod system of `The Elder Scrolls` and other games. Aims to keep the plguin flexibility and maximum compatibility between plugins.

Although a plugin always contains many entries, the documentation assumes each json contains only one entry/object.

## Basic Design

A patched property must contains an `operator`.

A object must have a global uniqued field to identity objects. In this document, it's `$id`.

### Master File

A plugin needs add `Master` to their definition to make reference works properly.

Example in this documentation won't show this while the example only contains object.

## Operator

### `$import`

Type: `Reference`.

`$import` generates a object by reference.

<details>
<summary>Example</summary>

```javascript
// a.json
{
  "$id": "obj-a",
  "a": {
    "prop": "property A"
  },
  "foo": "bar"
}
```

```javascript
// b.json
{
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
{
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
{
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

### `$strategy`

Type: `Enum`.

`$strategy` points how object merge works.

Avaliable values:
- merge (default): will add all new properties and replace all existed properties to object. Unlisted properties keep unchanged.
- replace: Replace whole object. This doesn't control the array property.
- replace-exist: adds nothing, only replaces all existed properties to object.
- add-newly: replaces nothing, only adds all new properties to object.

`$strategy` doesn't control array. Array strategy is special, see `$strategy-array`.

### `$strategy-array`

Type: `Enum`.

`$strategy-array` points how array merge works.

Avaliable values:
- append (default): doesn't change existed elements
- replace: clear all existed elements in all plugins

If `$strategy-array` is `append`, some more operator can be set.

#### `$strategy-array-clear-specific`

Type: `List<Reference>`.

Clear all speciific elements in listed values.

```javascript
// c.json
{
  "arr": {
    "$strategy-array-clear-plugin": [
      "b.json#/arr",
      "c.json#/arr/0",
    ],
    "$value": [
      {
        "prop": "foo",
      }
    ]
  }
}
```

### `$ref`



### `$remove`

Type: `List<String>`.

`$remove` contains a name list of property which should be removed.

### `$replace`

### `$keep`

Type: `Enum`.

`$keep` marks a property is required by this plugin.

Available values:
- exist (default): This prevents or warning any plugins wants to remove this property.
- ref: This validate the final value of this property is the given reference.

If `$keep` is `ref`, a `$keep-ref` operator must be set.

#### `$keep-ref`

Type: `Reference`.

### `$match`