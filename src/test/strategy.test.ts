import {Nymph, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {ElementMatcherDef} from "../operator/ListMatcher";

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
}, {
    "$id": "objA",
    "arrToMutate": [
        {
            "name": "ele0",
        },
        {
            "name": "ele1",
        },
        {
            "name": "ele2",
        },
        {
            "name": "ele3",
        },
    ],
}, {
    "$id": "objA",
    "arrToMutate": {
        "$value": [
            {
                "attr": "attr0",
            },
            {
                "attr": "attr1",
            },
            {
                "attr": "attr2",
            },
            {
                "attr": "last",
            },
        ],
        "$list-mutate": [
            {
                "$strategy": "insert",
                "$source": 0,
                "$to": {
                    "$find-strategy": "first",
                    "$matcher": {
                        "name": {
                            "$equals": "ele0",
                        }
                    },
                },
                "$insert-type": "before",
            }, {
                "$strategy": "insert",
                "$source": 0,
                "$to": {
                    "$find-strategy": "all",
                    "$matcher": {
                        "name": {
                            "$includes": "ele",
                        }
                    },
                },
                "$insert-type": "after",
            }, {
                "$strategy": "replace",
                "$source": 1,
                "$to": {
                    "$find-strategy": "first",
                    "$matcher": {
                        "name": {
                            "$equals": "ele1",
                        }
                    },
                },
            }, {
                "$strategy": "merge",
                "$source": 2,
                "$to": {
                    "$find-strategy": "first",
                    "$matcher": {
                        "name": {
                            "$equals": "ele2",
                        }
                    },
                },
            }
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

    // Strategy-list-mutate
    expect(nymph.processed["objA"]["arrToMutate"].length).toBe(7);
    //  insert before `first` equals ele0
    expect(nymph.processed["objA"]["arrToMutate"][0]["name"]).toBe(undefined);
    expect(nymph.processed["objA"]["arrToMutate"][0]["attr"]).toBe("attr0");
    //  insert after `all` includes ele
    expect(nymph.processed["objA"]["arrToMutate"][5]["name"]).toBe(undefined);
    expect(nymph.processed["objA"]["arrToMutate"][5]["attr"]).toBe("attr0");
    //  replace ele1
    expect(nymph.processed["objA"]["arrToMutate"][2]["name"]).toBe(undefined);
    expect(nymph.processed["objA"]["arrToMutate"][2]["attr"]).toBe("attr1");
    //  merger ele2
    expect(nymph.processed["objA"]["arrToMutate"][3]["name"]).toBe("ele2");
    expect(nymph.processed["objA"]["arrToMutate"][3]["attr"]).toBe("attr2");
    //  last fallback
    expect(nymph.processed["objA"]["arrToMutate"][6]["name"]).toBe(undefined);
    expect(nymph.processed["objA"]["arrToMutate"][6]["attr"]).toBe("last");
});

