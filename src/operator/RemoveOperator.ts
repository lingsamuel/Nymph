import {logger} from "../merger";
import {Operator} from "./Operator";

export type RemoveDef = {
    "$remove": string[] | string,
}

export class RemoveOperator extends Operator {
    op(): "$remove" {
        return "$remove";
    }

    opProp() {
        return `${this.op()}-prop`;
    }

    action(base: any, patch: RemoveDef, flaggedProps: string[], currentProp: string) {
        delete base[currentProp];
    }

    apply(base: object, patch: RemoveDef): object {
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
            base[this.opProp()].push(...properties);
        } else {
            logger.log(`Unknown ${this.op()} ${properties}`)
        }
        return base;
    }
}
