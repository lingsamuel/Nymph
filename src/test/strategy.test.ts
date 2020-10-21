import {Nymph, NymphObject} from "../merger";
import {expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a: NymphObject = {
    "$id": "objA",
    "objProperty": {
        "prop": "objA#objProperty.prop Value",
        "objPropertyInner": {
            "attr": "name",
        },
    },
    "toBeChangeProperty": "oldVal",
    "toBeDelete": "val",
}

const patch: NymphObject[] = [{
    "$id": "objA",
    "objProperty": {
        "$strategy": "merge",
        "objNewProperty": "objA#objProperty.objNewProperty Value",
        "objPropertyInner": {
            "$strategy": "replace",
            "newAttr": "newAttr",
        },
    },
    "newProperty": "objA#newProperty Value",
    "toBeChangeProperty": "changed",
}, {
    "$id": "objA",
    "$remove": "toBeDelete",
}
];

test("test", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)
    // Merge
    expect(nymph.processed["objA"]["toBeChangeProperty"]).toBe("changed");
    expect(nymph.processed["objA"]["newProperty"]).toBe("objA#newProperty Value");

    // Merge Recursive
    expect(nymph.processed["objA"]["objProperty"]["prop"]).toBe("objA#objProperty.prop Value"); // 原值不变
    expect(nymph.processed["objA"]["objProperty"]["objNewProperty"]).toBe("objA#objProperty.objNewProperty Value"); // 新增

    expect(nymph.processed["objA"]["objProperty"]["objPropertyInner"]["attr"]).toBe(undefined);
    expect(nymph.processed["objA"]["objProperty"]["objPropertyInner"]["newAttr"]).toBe("newAttr");
});
