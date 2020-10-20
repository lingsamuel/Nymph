import {Nymph, NymphObject, NymphPlugin} from "../merger";
import {describe, expect, test} from '@jest/globals'
import {buildPlugins} from "./utils";

const a : NymphObject = {
    "$id": "objA",
    "toBeDelete": "val",
}

const patch : NymphObject[] = [{
    "$id": "objA",
    "$remove": "toBeDelete",
}
];

test("test", () => {
    const nymph = new Nymph(...buildPlugins(a, patch));
    console.log(nymph.processed)
    // Remove
    expect(nymph.processed["objA"]["toBeDelete"]).toBe(undefined);
    expect(nymph.processed["objA"]["$remove-prop"]!.length).toBe(1);
    expect(nymph.processed["objA"]["$remove-prop"]![0]).toBe("toBeDelete");
});
