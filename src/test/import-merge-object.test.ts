import {Nymph, NymphObject, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a: NymphObject[] = [{
    "$id": "objA",
    "obj1": {
        "attr1": "origin",
    },
    "obj2": {
        "attr1": "origin",
    },
    "obj3": {
        "attr1": "origin",
    },
    "obj4": {
        "attr1": "origin",
    },
}, {
    "$id": "objB",
    "obj1": {
        "attr1": "attr1",
        "attr2": "attr2",
        "attr3": "attr3",
    },
    "obj2": {
        "attr1": "attr1",
    },
    "obj3": {
        "attr1": "attr1",
        "attr2": "attr2",
        "attr3": "attr3",
    },
    "obj4": {
        "attr1": "attr1",
        "attr2": "attr2",
        "attr3": "attr3",
    },
}]

const patch: NymphObject[] = [{
    "$id": "objA",
    "$import": "objB",
    "$import-strategy": {
        "obj1": "merge",
        "obj2": "replace",
        "obj3": "replace-exist",
        "obj4": "add-new",
    },
}
];

test("import-strategy (obj)", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)

    // import-strategy (obj)
    //  merge
    expect(nymph.processed["objA"]["obj1"]["attr1"]).toBe("attr1")
    expect(nymph.processed["objA"]["obj1"]["attr2"]).toBe("attr2")
    expect(nymph.processed["objA"]["obj1"]["attr3"]).toBe("attr3")
    //  replace
    expect(nymph.processed["objA"]["obj2"]["attr1"]).toBe("attr1")
    expect(nymph.processed["objA"]["obj2"]["attr2"]).toBe(undefined)
    expect(nymph.processed["objA"]["obj2"]["attr3"]).toBe(undefined)
    //  replace-exist
    expect(nymph.processed["objA"]["obj3"]["attr1"]).toBe("attr1")
    expect(nymph.processed["objA"]["obj3"]["attr2"]).toBe(undefined)
    expect(nymph.processed["objA"]["obj3"]["attr3"]).toBe(undefined)
    //  add-new
    expect(nymph.processed["objA"]["obj4"]["attr1"]).toBe("origin")
    expect(nymph.processed["objA"]["obj4"]["attr2"]).toBe("attr2")
    expect(nymph.processed["objA"]["obj4"]["attr3"]).toBe("attr3")
});
