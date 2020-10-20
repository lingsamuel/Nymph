import {logger, NymphPatchObject} from "../merger";
import {Operator} from "./Operator";
import {isObject, isPrimitive} from "../type";

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
            base[this.opProp()] = [];
        }
        base[this.opProp()] = properties;
        return base;
    }
}
