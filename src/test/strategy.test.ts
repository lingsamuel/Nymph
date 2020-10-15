import {Nymph, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'

const a = {
    "$id": "objA",
    "objProperty": {
        "prop": "objA#objProperty.prop Value"
    },
    "toBeChangeProperty": "oldVal",
    "toBeDelete": "val",
}

const patch = [{
    "$id": "objA",
    "objProperty": {
        "$strategy": "merge",
        "arrNewProperty": "objA#objProperty.arrNewProperty Value"
    },
    "newProperty": "objA#newProperty Value",
    "toBeChangeProperty": "changed",
}, {
    "$id": "objA",
    "$remove": "toBeDelete",
}];

const pluginA = new NymphPlugin();
pluginA.objects.push(a);

const pluginPatch = new NymphPlugin();
pluginPatch.objects = pluginPatch.objects.concat(patch);

test("Basic merge strategy", () => {
    const nymph = new Nymph(pluginA, pluginPatch);
    console.log(nymph.processed)
    // Merge
    expect(nymph.processed["objA"]["toBeChangeProperty"]).toBe("changed");
    expect(nymph.processed["objA"]["newProperty"]).toBe("objA#newProperty Value");

    // Merge Recursive
    expect(nymph.processed["objA"]["objProperty"]["prop"]).toBe("objA#objProperty.prop Value"); // 原值不变
    expect(nymph.processed["objA"]["objProperty"]["arrNewProperty"]).toBe("objA#objProperty.arrNewProperty Value"); // 新增

    // Remove
    expect(nymph.processed["objA"]["toBeDelete"]).toBe(undefined);
});

