import {Operator} from "./Operator";
import {NymphDataType} from "../merger";
import {ListOpDef} from "./ListOperator";

export type ListRemoveDef = ListOpDef & {
    "$list-remove"?: string | string[],
}

export class ListRemoveOperator extends Operator {

    op(): "$list-remove" {
        return "$list-remove";
    }

    apply(base: NymphDataType[], patch: ListRemoveDef): NymphDataType[] {
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