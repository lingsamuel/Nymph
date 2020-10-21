import {Nymph, NymphObject, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a: NymphObject[] = [{
    "$id": "objA",
    "attr1": "origin",
}, {
    "$id": "objB",
    "attr1": "attr1",
    "attr2": "attr2",
    "attr3": "attr3",
}]

const patch: NymphObject[] = [{
    "$id": "objA",
    "$import": "objB",
    "$import-pick": [
        "attr1",
        "attr2",
    ],
}
];

test("import-pick", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)

    // import
    expect(nymph.processed["objA"]["attr1"]).toBe("attr1")
    expect(nymph.processed["objA"]["attr2"]).toBe("attr2")
    expect(nymph.processed["objA"]["attr3"]).toBe(undefined)
});
