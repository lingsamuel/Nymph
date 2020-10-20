import {Operator} from "./Operator";
import {logger, NymphDataType} from "../merger";
import {ListMutateDef, ListMutateOperator} from "./ListMutateOperator";
import {isObject} from "../type";
import {ListRemoveDef, ListRemoveOperator} from "./ListRemoveOperator";
import {ListRemoveMatchDef, ListRemoveMatchOperator} from "./ListRemoveMatchOperator";
import {ListOpDef} from "./ListOperator";

export type ListMergeDef = ListOpDef & {
    "$list-strategy"?: "replace" | "append" | "prepend",
} | NymphDataType[];

export class ListMergeOperator extends Operator {
    op(): "$list-strategy" {
        return "$list-strategy";
    }

    apply(base: NymphDataType[], patch: ListMergeDef & ListMutateDef & ListRemoveDef & ListRemoveMatchDef): NymphDataType[] {
        if (Array.isArray(patch)) {
            // base value is array，patch value is array，applying default strategy `append`
            base.push(...patch);
            return base;
        } else if (!isObject(patch)) {
            // other cases are invalid
            logger.log(`Cannot merge ${patch} to array ${base})`);
            return base;
        }

        let strategy = patch[this.op()];
        if (strategy == "replace") {
            return patch["$value"] ? patch["$value"] : [];
        }

        if (strategy == undefined) {
            strategy = "append";
        }

        base = this.newOp(ListRemoveOperator).apply(base, patch as ListRemoveDef);
        base = this.newOp(ListRemoveMatchOperator).apply(base, patch as ListRemoveMatchDef);
        base = this.newOp(ListMutateOperator).apply(base, patch as ListMutateDef);

        // 处理 list-operator
        let newList = patch["$value"];
        if (newList == undefined) {
            newList = []
        }

        if (strategy == "append") {
            return base.concat(newList)
        } else if (strategy == "prepend") {
            return newList.concat(base)
        } else {
            logger.log(`Unknown list-strategy ${strategy}`);
        }
        return base;
    }
}