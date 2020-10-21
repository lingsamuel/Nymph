import {Operator} from "./Operator";
import {ElementMatcherDef, ListElementMatcher} from "./ListMatcher";
import {NymphDataType} from "../merger";
import {ListOpDef} from "./ListOperator";

export type ListRemoveMatchDef = ListOpDef & {
    "$list-remove-match"?: ElementMatcherDef[];
}

export class ListRemoveMatchOperator extends Operator {

    op(): "$list-remove-match" {
        return "$list-remove-match";
    }

    apply(base: NymphDataType[], patch: ListRemoveMatchDef): NymphDataType[] {
        const op = patch[this.op()];
        if (op == undefined) {
            return base;
        }

        const matcher = new ListElementMatcher(op);
        const idx = matcher.match(base);
        for (let i of idx) {
            delete base[i]
        }
        base = base.filter(x => x != null)
        return base;
    }
}