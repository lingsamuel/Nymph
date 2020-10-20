import {Nymph, NymphDataType, NymphObject, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a : NymphObject = {
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
}

const patch : any[] = [{
    "$id": "objA",
    "arrToMutate": { // Compiler treats this field as type `NymphDataType` and raises error
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
                "attr": "last", // No presents in list-mutate, fallback
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

test("list-mutate", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(JSON.stringify(nymph.processed))
    // list-mutate
    expect((nymph.processed["objA"]["arrToMutate"] as NymphDataType[]).length).toBe(7);
    //  insert before `first` equals ele0
    expect(nymph.processed["objA"]["arrToMutate"][0]["name"]).toBe(undefined);
    expect(nymph.processed["objA"]["arrToMutate"][0]["attr"]).toBe("attr0");
    //  insert after `all` includes ele
    expect(nymph.processed["objA"]["arrToMutate"][5]["name"]).toBe(undefined);
    expect(nymph.processed["objA"]["arrToMutate"][5]["attr"]).toBe("attr0");
    //  replace ele1
    expect(nymph.processed["objA"]["arrToMutate"][2]["name"]).toBe(undefined);
    expect(nymph.processed["objA"]["arrToMutate"][2]["attr"]).toBe("attr1");
    //  last fallback
    expect(nymph.processed["objA"]["arrToMutate"][6]["name"]).toBe(undefined);
    expect(nymph.processed["objA"]["arrToMutate"][6]["attr"]).toBe("last");
    //  merger ele2
    expect(nymph.processed["objA"]["arrToMutate"][3]["name"]).toBe("ele2");
    expect(nymph.processed["objA"]["arrToMutate"][3]["attr"]).toBe("attr2");
});

