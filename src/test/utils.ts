import {NymphObject, NymphPlugin} from "../merger";
import {isArray} from "../type";

export function buildPlugins(...objects: (NymphObject | NymphObject[]) []): NymphPlugin[] {
    return objects.map((x) => {
        if (isArray(x)) {
            return new NymphPlugin(...x);
        } else {
            return new NymphPlugin(x);
        }
    });
}

