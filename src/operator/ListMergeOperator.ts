import {Operator} from "./Operator";
import {logger} from "../merger";
import {ListRemoveDef, ListRemoveOperator} from "./ListRemoveOperator";
import {ListRemoveMatcherOperator, ListRemoveMatcherDef} from "./ListRemoveMatcherOperator";

type ListMergeReplaceDef = {
    "$strategy-list": "replace",
};

type ListMergeMergeDef = {
    "$strategy-list": "append" | "prepend",
} & Partial<ListRemoveDef> & Partial<ListRemoveMatcherDef>;

export type ListMergeDef = ListMergeReplaceDef | ListMergeMergeDef;

export class ListMergeOperator extends Operator {

    op(): string {
        return "$strategy-list";
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

        // 处理 list-operator
        let newList = patch["$value"];
        if (newList == undefined) {
            newList = []
        }

        base = this.newOp(ListRemoveOperator).apply(base, patch);
        base = this.newOp(ListRemoveMatcherOperator).apply(base, patch);

        if (strategy == "append") {
            return base.concat(newList)
        } else if (strategy == "prepend") {
            return newList.concat(base)
        } else {
            logger.log(`Unknown strategy-list ${strategy}`);
        }
        return base;
    }
}