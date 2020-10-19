import {Operator} from "./Operator";
import {ListElementMatcher, ElementMatcherDef} from "./ListMatcher";

export type ListRemoveMatcherDef = {
    "$list-remove-matcher": ElementMatcherDef[];
}

export class ListRemoveMatcherOperator extends Operator {

    op(): string {
        return "$list-remove-matcher";
    }

    apply(base: object[], patch: {
        "$value": any[]
    } & ListRemoveMatcherDef): object[] {
        const op: ElementMatcherDef[] = patch[this.op()];
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