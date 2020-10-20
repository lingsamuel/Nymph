import {Nymph, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a = {
    "$id": "objA",
    "arrToRemoveElement": [
        "1", "2", "3", "4", "5"
    ],
    "arrToRemoveObjElement": [
        {
            "name": "ele1"
        }, {
            "name": "ele2"
        }
    ],
}

const patch = [{
    "$id": "objA",
    "arrToRemoveElement": {
        "$list-remove": [
            "0",
            "/1-3,!2", // 0, 1, 3
        ],
        "$list-remove-matcher": [
            {
                "$find-strategy": "first",
                "$matcher": "5",
            }
        ]
    },
    "arrToRemoveObjElement": {
        "$list-remove-matcher": [
            {
                "$find-strategy": "first",
                "$matcher": {
                    "name": {
                        "$equals": "ele2",
                    }
                },
            }
        ]
    },
}
];

test("list-remove", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)
    // list-remove
    expect(nymph.processed["objA"]["arrToRemoveElement"].length).toBe(1);
    expect(nymph.processed["objA"]["arrToRemoveElement"][0]).toBe("3");

    expect(nymph.processed["objA"]["arrToRemoveObjElement"].length).toBe(1);
    expect(nymph.processed["objA"]["arrToRemoveObjElement"][0]["name"]).toBe("ele1");
});

