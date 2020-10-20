import {Operator} from "./Operator";
import {ListElementMatcher, ElementMatcherDef} from "./ListMatcher";

export type ListRemoveMatchDef = {
    "$value": any[],
    "$list-remove-match": ElementMatcherDef[];
}

export class ListRemoveMatchOperator extends Operator {

    op(): "$list-remove-match" {
        return "$list-remove-match";
    }

    apply(base: object[], patch: ListRemoveMatchDef): object[] {
        const op = patch[this.op()];
        if (op != undefined) {
            const matcher = new ListElementMatcher(op);
            const idx = matcher.match(base);
            for (let i of idx) {
                delete base[i]
            }
            base = base.filter(x => x != null)
        }
        return base;
    }
}