import {Operator} from "./Operator";
import {logger} from "../merger";
import {ListRemoveDef, ListRemoveOperator} from "./ListRemoveOperator";
import {ListRemoveMatcherOperator, ListRemoveMatcherDef} from "./ListRemoveMatcherOperator";
import {ListMutateOperator} from "./ListMutateOperator";

type ListMergeReplaceDef = {
    "$list-strategy": "replace",
};

type ListMergeMergeDef = {
    "$list-strategy": "append" | "prepend",
} & Partial<ListRemoveDef> & Partial<ListRemoveMatcherDef>;

export type ListMergeDef = ListMergeReplaceDef | ListMergeMergeDef;

export class ListMergeOperator extends Operator {

    op(): string {
        return "$list-strategy";
    }

    apply(base: object[], patch: {
        "$value": any[]
    } & ListMergeDef): object[] {
        let strategy = patch[this.op()];
        if (strategy == undefined) {
            strategy = "append";
            patch[this.op()] = strategy;
        }
        if (strategy == "replace") {
            return patch["$value"];
        }

        base = this.newOp(ListRemoveOperator).apply(base, patch);
        base = this.newOp(ListRemoveMatcherOperator).apply(base, patch);
        base = this.newOp(ListMutateOperator).apply(base, patch);

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