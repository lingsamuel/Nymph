import {Nymph, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a = {
    "$id": "objA",
    "objToReplace": {
        "attr": "attr",
    },
    "objToReplaceExist": {
        "attr": "attr",
    },
    "objToAdd": {
        "attr": "attr",
    },
    "objToMerge": {
        "attr": "attr",
    },
};

const patch = [{
    "$id": "objA",
    "objToReplace": {
        "$strategy": "replace",
        "new": "new-attr",
    },
    "objToReplaceExist": {
        "$strategy": "replace-exist",
        "attr": "attr-changed",
        "new": "new-attr",
    },
    "objToAdd": {
        "$strategy": "add-new",
        "attr": "attr-changed",
        "new": "new-attr",
    },
    "objToMerge": {
        "$strategy": "merge",
        "attr": "attr-changed",
        "new": "new-attr",
    },
}
];

test("merge", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)// Replace
    expect(nymph.processed["objA"]["objToReplace"]["attr"]).toBe(undefined);
    expect(nymph.processed["objA"]["objToReplace"]["new"]).toBe("new-attr");
    // Replace-exist
    expect(nymph.processed["objA"]["objToReplaceExist"]["attr"]).toBe("attr-changed");
    expect(nymph.processed["objA"]["objToReplaceExist"]["new"]).toBe(undefined);
    // Add-new
    expect(nymph.processed["objA"]["objToAdd"]["attr"]).toBe("attr");
    expect(nymph.processed["objA"]["objToAdd"]["new"]).toBe("new-attr");
    // Merge
    expect(nymph.processed["objA"]["objToMerge"]["attr"]).toBe("attr-changed");
    expect(nymph.processed["objA"]["objToMerge"]["new"]).toBe("new-attr");
});

