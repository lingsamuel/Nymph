import {Nymph, NymphDataType, NymphObject} from "../merger";
import {expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a: NymphObject = {
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

const patch: NymphObject[] = [{
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
    expect((nymph.processed["objA"]["arrBeReplaced"] as NymphDataType[]).length).toBe(1);
    expect(nymph.processed["objA"]["arrBeReplaced"][0]).toBe("d");
    //  append
    expect((nymph.processed["objA"]["arrBeAppended"] as NymphDataType[]).length).toBe(4);
    expect(nymph.processed["objA"]["arrBeAppended"][3]).toBe("d");
    //  prepend
    expect((nymph.processed["objA"]["arrBePrepended"] as NymphDataType[]).length).toBe(4);
    expect(nymph.processed["objA"]["arrBePrepended"][0]).toBe("d");
});

