import {logger} from "../merger";
import {Operator} from "./Operator";

export abstract class AttributesFlagOperator extends Operator {

    opProp() {
        return `${this.op()}-prop`;
    }

    action(base: any, patch: any, flaggedProps: string[], currentProp: string) {

    }

    apply(base: object, patches: any): object {
        for (let patch of patches) {
            let properties = patch[this.op()];
            if (properties != undefined) {
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
                    base[this.opProp()].push(...properties);
                } else {
                    logger.log(`Unknown ${this.op()} ${properties}`)
                }
            }
        }
        return base;
    }
}
