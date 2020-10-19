import {Operator} from "./Operator";
import {ElementMatcherDef} from "./ListMatcher";
import {EntryReference} from "../type";

export type ListRemoveDef = {
    "$list-remove": (EntryReference | ElementMatcherDef)[],
}

export class ListRemoveOperator extends Operator {

    op(): string {
        return "$list-remove";
    }

    apply(base: object[], patch: {
        "$value": any[]
    } & ListRemoveDef): object[] {
        if (patch[this.op()] != undefined) {
            const op: ListRemoveDef = patch[this.op()];
            if (typeof op == "string" || Array.isArray(op)) {
                const idx = this.merger.parseIndexer(op)
                for (let i of idx) {
                    delete base[i]
                }
                base = base.filter(x => x != null)
            }
        }
        return base;
    }
}