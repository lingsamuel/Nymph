import {logger} from "../merger";
import {Operator} from "./Operator";

export abstract class FlagOperator extends Operator {

    opProp() {
        return `${this.op()}-prop`;
    }

    action(base: any, patch: any, flaggedProps: string[], currentProp: string) {

    }

    apply(obj: { base: any, patches: any[] }): any {
        let base = obj.base;
        for (let patch of obj.patches) {
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
