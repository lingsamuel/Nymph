import {logger} from "../merger";
import {Operator} from "./Operator";

export type KeepDef = {
    "$keep": string[] | string,
}

export class KeepOperator extends Operator {
    op(): "$keep" {
        return "$keep";
    }

    opProp() {
        return `${this.op()}-prop`;
    }

    apply(base: object, patch: KeepDef): object {
        let properties = patch[this.op()];
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
            base[this.opProp()].push(...properties);
        } else {
            logger.log(`Unknown ${this.op()} ${properties}`)
        }
        return base;
    }
}
