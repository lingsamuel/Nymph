import {Nymph, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a = {
    "$id": "objA",
    "propToKeep": "keep",
    "propToKeep2": "keep2",
    "propToKeepRef": "keep-ref",
    "propToBeRef": "keep-ref",
}

const patch = [{
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

test("keep", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)

    // keep & keep-ref
    expect(nymph.processed["objA"]["$keep-prop"].length).toBe(2);
    expect(nymph.processed["objA"]["$keep-prop"][0]).toBe("propToKeep");
    expect(nymph.processed["objA"]["$keep-prop"][1]).toBe("propToKeep2");
    expect(nymph.processed["objA"]["propToKeepRef"]["$keep-ref"]).toBe("objA#propToBeRef");
    expect(nymph.processed["objA"]["propToKeepRef"]["$value"]).toBe("keep-ref");
});
