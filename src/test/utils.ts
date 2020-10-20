import {NymphObject, NymphPlugin} from "../merger";

export function buildPlugins(...objects: (NymphObject | NymphObject[]) []): NymphPlugin[] {
    return objects.map((x) => {
        if (Array.isArray(x)) {
            return new NymphPlugin(...x);
        } else {
            return new NymphPlugin(x);
        }
    });
}

