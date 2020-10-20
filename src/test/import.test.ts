import {Nymph, NymphObject, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a : NymphObject[] = [{
    "$id": "objA",
    "attr1": "origin",
}, {
    "$id": "objB",
    "attr1": "changed",
    "attr2": "changed",
}]

const patch : NymphObject[] = [{
    "$id": "objA",
    "$import": "objB"
}
];

test("import", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)

    // import
    expect(nymph.processed["objA"]["attr1"]).toBe("changed")
    expect(nymph.processed["objA"]["attr2"]).toBe("changed")
});
