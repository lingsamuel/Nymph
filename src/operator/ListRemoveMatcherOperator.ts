import {Operator} from "./Operator";
import {ListElementMatcherOperator} from "./ListMatcher";
import {logger} from "../merger";

export class ListRemoveMatcherOperator extends Operator {

    op(): string {
        return "$list-remove-matcher";
    }

    apply(base: object[], patch: {
        "$value": any[]
    } & any): object[] {
        if (patch["$list-remove-matcher"] != undefined) {
            const matcher = new ListElementMatcherOperator(patch["$list-remove-matcher"])
            const idx = matcher.find(base);
            for (let i of idx) {
                delete base[i]
            }
            base = base.filter(x => x != null)
        }
        return base;
    }
}