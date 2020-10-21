import {NymphPatchObject} from "../merger";
import {Operator} from "./Operator";

export type ObjectKeepRefDef = {
    "$keep-ref"?: {
        [key: string]: string,
    },
}

export class ObjectKeepRefOperator extends Operator {
    op(): "$keep-ref" {
        return "$keep-ref";
    }

    opProp(): "$keep-ref-prop" {
        return "$keep-ref-prop";
    }

    apply(base: NymphPatchObject, patch: ObjectKeepRefDef): NymphPatchObject {
        let properties = patch[this.op()];
        if (properties == undefined) {
            return base;
        }

        if (base[this.opProp()] == undefined) {
            base[this.opProp()] = {};
        }
        for (let key of Object.keys(properties)) {
            base[this.opProp()]![key] = properties[key];
        }
        return base;
    }
}
