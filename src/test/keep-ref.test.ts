import {Nymph, NymphObject} from "../merger";
import {expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a: NymphObject = {
    "$id": "objA",
    "propToKeepRef": "keep-ref",
    "propToBeRef": "keep-ref",
}

const patch: NymphObject[] = [{
    "$id": "objA",
    "$keep-ref": {
        "propToKeepRef": "objA#propToBeRef"
    }
}
];

test("keep-ref", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)

    // keep-ref
    expect(nymph.processed["objA"]["$keep-ref-prop"]["propToKeepRef"]).toBe("objA#propToBeRef");
    expect(nymph.processed["objA"]["propToKeepRef"]).toBe("keep-ref");
});
