import {Nymph, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'

const a = {
    "$id": "objA",
    "propToKeep": "keep",
    "propToKeep2": "keep2",
    "propToKeepRef": "keep-ref",
    "propToBeRef": "keep-ref",
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
}, {
    "$id": "objA",
    "arrToRemoveElement": [
        "1", "2", "3", "4", "5"
    ],
    "arrToRemoveObjElement": [
        {
            "name": "ele1"
        }, {
            "name": "ele2"
        }
    ],
}, {
    "$id": "objA",
    "arrToRemoveElement": {
        "$list-remove": [
            "0",
            "/1-3,!2", // 0, 1, 3
        ],
        "$list-remove-matcher": [
            {
                "$find-strategy": "first",
                "$matcher": "5",
            }
        ]
    },
    "arrToRemoveObjElement": {
        "$list-remove-matcher": [
            {
                "$find-strategy": "first",
                "$matcher": {
                    "name": {
                        "$equals": "ele2",
                    }
                },
            }
        ]
    },
}, {
    "$id": "objA",
    "$keep": [
        "propToKeep"
    ],
    "propToKeepRef": {
        "$keep-ref": "objA#propToBeRef"
    }
}, {
    "$id": "objA",
    "$keep": "propToKeep2",
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
    expect(nymph.processed["objA"]["$remove-prop"].length).toBe(1);
    expect(nymph.processed["objA"]["$remove-prop"][0]).toBe("toBeDelete");

    // keep & keep-ref
    expect(nymph.processed["objA"]["$keep-prop"].length).toBe(2);
    expect(nymph.processed["objA"]["$keep-prop"][0]).toBe("propToKeep");
    expect(nymph.processed["objA"]["$keep-prop"][1]).toBe("propToKeep2");
    expect(nymph.processed["objA"]["propToKeepRef"]["$keep-ref"].length).toBe(1);
    expect(nymph.processed["objA"]["propToKeepRef"]["$keep-ref"][0]).toBe("objA#propToBeRef");
    expect(nymph.processed["objA"]["propToKeepRef"]["$value"]).toBe("keep-ref");

    // Strategy-list
    //  replace
    expect(nymph.processed["objA"]["arrBeReplaced"].length).toBe(1);
    expect(nymph.processed["objA"]["arrBeReplaced"][0]).toBe("d");
    //  append
    expect(nymph.processed["objA"]["arrBeAppended"].length).toBe(4);
    expect(nymph.processed["objA"]["arrBeAppended"][3]).toBe("d");
    //  prepend
    expect(nymph.processed["objA"]["arrBePrepended"].length).toBe(4);
    expect(nymph.processed["objA"]["arrBePrepended"][0]).toBe("d");

    // Strategy-list-remove
    expect(nymph.processed["objA"]["arrToRemoveElement"].length).toBe(1);
    expect(nymph.processed["objA"]["arrToRemoveElement"][0]).toBe("3");

    expect(nymph.processed["objA"]["arrToRemoveObjElement"].length).toBe(1);
    expect(nymph.processed["objA"]["arrToRemoveObjElement"][0]["name"]).toBe("ele1");
});

