import {Operator} from "./Operator";

export type ListRemoveDef = {
    "$value": any[],
    "$list-remove": (string)[],
}

export class ListRemoveOperator extends Operator {

    op(): "$list-remove" {
        return "$list-remove";
    }

    apply(base: object[], patch: ListRemoveDef): object[] {
        const op = patch[this.op()];
        if (op == undefined) {
            return base;
        }

        if (typeof op == "string" || Array.isArray(op)) {
            const idx = this.merger.parseIndexer(op)
            for (let i of idx) {
                delete base[i]
            }
            base = base.filter(x => x != null)
        }
        return base;
    }
}