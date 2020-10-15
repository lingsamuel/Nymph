import {logger} from "../merger";
import {Operator} from "./Operator";

export class RemoveOperator extends Operator {
    // Strategy Operator process basic properties changes
    op(): string {
        return "$remove";
    }

    apply(obj: { base: any; patches: any[] }): any {
        let base = obj.base;
        for (let patch of obj.patches) {
            let properties = patch[this.op()];
            if (properties != undefined) {
                if (typeof properties == "string") {
                    properties = [properties];
                }

                if (Array.isArray(properties)) {
                    for (let prop of properties) {
                        delete base[prop];
                    }
                } else {
                    logger.log(`Unknown remove ${properties}`)
                }
            }
        }
        return base;
    }
}
