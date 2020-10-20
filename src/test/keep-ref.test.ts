import {Nymph, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a = {
    "$id": "objA",
    "propToKeepRef": "keep-ref",
    "propToBeRef": "keep-ref",
}

const patch = [{
    "$id": "objA",
    "propToKeepRef": {
        "$keep-ref": "objA#propToBeRef"
    }
}
];

test("keep", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)

    // keep-ref
    expect(nymph.processed["objA"]["propToKeepRef"]["$keep-ref"]).toBe("objA#propToBeRef");
    expect(nymph.processed["objA"]["propToKeepRef"]["$value"]).toBe("keep-ref");
});
