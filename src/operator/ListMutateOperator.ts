import {Operator} from "./Operator";
import {ListElementMatcher} from "./ListMatcher";
import {ListElementMatcherDef} from "../type";

export type ListMutateDef = {
    "$list-mutate": PatchListMutateElementDef[],
}

export type PatchListMutateElementDef = {
    "$op": "replace" | "merge",
    "$source": number,
    "$to": ListElementMatcherDef, // `-` means last. `-N` means N before last. Reference must be single, not range
} | {
    "$op": "insert",
    "$source": number,
    "$to": ListElementMatcherDef,
    "$insert-type": "before" | "after",
}

export class ListMutateOperator extends Operator {
    op(): string {
        return "$list-mutate";
    }

    apply(base: object[], patch: {
        "$value": any[]
    } & ListMutateDef & any): object[] {
        const op: PatchListMutateElementDef[] = patch[this.op()];
        if (op == undefined || !Array.isArray(op) || op.length == 0) {
            return base;
        }

        const matcher = new ListElementMatcher(op)
        const idx = matcher.match(base);
        for (let i of idx) {
            delete base[i]
        }
        base = base.filter(x => x != null)
        return base;
    }
}