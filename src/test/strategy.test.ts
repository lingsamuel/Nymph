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
        "objNewProperty": "objA#objProperty.objNewProperty Value"
    },
    "newProperty": "objA#newProperty Value",
    "toBeChangeProperty": "changed",
}, {
    "$id": "objA",
    "$remove": "toBeDelete",
}, {
    "$id": "objA",
    "arrBeReplaced": [
        "a",
        "b",
        "c",
    ], "arrBeAppended": [
        "a",
        "b",
        "c",
    ], "arrBePrepended": [
        "a",
        "b",
        "c",
    ],
}, {
    "$id": "objA",
    "arrBeReplaced": {
        "$strategy-list": "replace",
        "$value": [
            "d",
        ],
    },
    "arrBeAppended": [
        "d",
    ],
    "arrBePrepended": {
        "$strategy-list": "prepend",
        "$value": [
            "d",
        ],
    },
}
];

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
    expect(nymph.processed["objA"]["objProperty"]["objNewProperty"]).toBe("objA#objProperty.objNewProperty Value"); // 新增

    // Remove
    expect(nymph.processed["objA"]["toBeDelete"]).toBe(undefined);

    // Strategy-list
    expect(nymph.processed["objA"]["arrBeReplaced"].length).toBe(1);
    expect(nymph.processed["objA"]["arrBeReplaced"][0]).toBe("d");

    expect(nymph.processed["objA"]["arrBeAppended"].length).toBe(4);
    expect(nymph.processed["objA"]["arrBeAppended"][3]).toBe("d");

    expect(nymph.processed["objA"]["arrBePrepended"].length).toBe(4);
    expect(nymph.processed["objA"]["arrBePrepended"][0]).toBe("d");

});

