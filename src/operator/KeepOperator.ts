import {logger, NymphPatchObject} from "../merger";
import {Operator} from "./Operator";

export type ObjectKeepDef = {
    "$keep"?: string[] | string,
}

export class KeepOperator extends Operator {
    op(): "$keep" {
        return "$keep";
    }

    opProp(): "$keep-prop" {
        return "$keep-prop";
    }

    apply(base:NymphPatchObject, patch: ObjectKeepDef): NymphPatchObject {
        let properties = patch["$keep"];
        if (properties == undefined) {
            return base;
        }
        if (typeof properties == "string") {
            properties = [properties];
        }

        if (Array.isArray(properties)) {
            if (base[this.opProp()] == undefined) {
                base[this.opProp()] = [];
            }
            base[this.opProp()]!.push(...properties);
        } else {
            logger.log(`Unknown ${this.op()} ${properties}`)
        }
        return base;
    }
}
