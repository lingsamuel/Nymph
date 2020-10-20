import {Nymph, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a = {
    "$id": "objA",
    "arrBeReplaced": [
        "a",
        "b",
        "c",
    ], "arrBeAppended": [
        "a",
        "b",
        "c",
    ], "arrBePrepended": [
        "a",
        "b",
        "c",
    ],
}

const patch = [{
    "$id": "objA",
    "arrBeReplaced": {
        "$list-strategy": "replace",
        "$value": [
            "d",
        ],
    },
    "arrBeAppended": [
        "d",
    ],
    "arrBePrepended": {
        "$list-strategy": "prepend",
        "$value": [
            "d",
        ],
    },
}
];

test("list-merge", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)
    // list-strategy
    //  replace
    expect(nymph.processed["objA"]["arrBeReplaced"].length).toBe(1);
    expect(nymph.processed["objA"]["arrBeReplaced"][0]).toBe("d");
    //  append
    expect(nymph.processed["objA"]["arrBeAppended"].length).toBe(4);
    expect(nymph.processed["objA"]["arrBeAppended"][3]).toBe("d");
    //  prepend
    expect(nymph.processed["objA"]["arrBePrepended"].length).toBe(4);
    expect(nymph.processed["objA"]["arrBePrepended"][0]).toBe("d");
});

