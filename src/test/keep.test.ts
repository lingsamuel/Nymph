import {Nymph, NymphObject} from "../merger";
import {expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a: NymphObject = {
    "$id": "objA",
    "propToKeep": "keep",
    "propToKeep2": "keep2",
}

const patch: NymphObject[] = [{
    "$id": "objA",
    "$keep": [
        "propToKeep"
    ],
}, {
    "$id": "objA",
    "$keep": "propToKeep2",
}
];

test("keep", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)

    // keep
    expect(nymph.processed["objA"]["$keep-prop"]!.length).toBe(2);
    expect(nymph.processed["objA"]["$keep-prop"]![0]).toBe("propToKeep");
    expect(nymph.processed["objA"]["$keep-prop"]![1]).toBe("propToKeep2");
});
