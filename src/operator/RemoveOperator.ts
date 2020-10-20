import {logger, NymphPatchObject} from "../merger";
import {Operator} from "./Operator";

export type RemoveDef = {
    "$remove"?: string[] | string,
}

export class RemoveOperator extends Operator {
    op(): "$remove" {
        return "$remove";
    }

    opProp(): "$remove-prop" {
        return "$remove-prop";
    }

    action(base: any, patch: RemoveDef, flaggedProps: string[], currentProp: string) {
        delete base[currentProp];
    }

    apply(base: NymphPatchObject, patch: RemoveDef): NymphPatchObject {
        let properties = patch[this.op()];
        if (properties == undefined) {
            return base;
        }

        if (typeof properties == "string") {
            properties = [properties];
        }

        if (Array.isArray(properties)) {
            for (let prop of properties) {
                this.action(base, patch, properties, prop);
            }
            if (base[this.opProp()] == undefined) {
                base[this.opProp()] = [];
            }
            base[this.opProp()]!.push(...properties);
        } else {
            logger.log(`Unknown ${this.op()} ${properties}`);
        }
        return base;
    }
}
