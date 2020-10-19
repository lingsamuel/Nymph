import {Operator} from "./Operator";
import {ListElementMatcherOperator} from "./ListMatcher";
import {logger} from "../merger";

export class ListRemoveOperator extends Operator {

    op(): string {
        return "$list-remove";
    }

    apply(base: object[], patch: {
        "$value": any[]
    } & any): object[] {
        if (patch["$list-remove"] != undefined) {
            const toRemove = patch["$list-remove"];
            if (typeof toRemove == "string" || Array.isArray(toRemove)) {
                const idx = this.merger.parseIndexer(toRemove)
                for (let i of idx) {
                    delete base[i]
                }
                base = base.filter(x => x != null)
            }
        }
        return base;
    }
}