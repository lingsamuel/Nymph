import {Operator} from "./Operator";
import {ListElementMatcherOperator} from "./ListMatcher";
import {logger} from "../merger";
import {ListRemoveOperator} from "./ListRemoveOperator";
import {ListRemoveMatcherOperator} from "./ListRemoveMatcherOperator";

export class ListMergeOperator extends Operator {

    op(): string {
        return "$strategy-list";
    }

    apply(base: object[], patch: {
        "$value": any[]
    } & any): object[] {
        let strategy = patch["$strategy-list"];
        if (strategy == undefined) {
            strategy = "append";
            patch["$strategy-list"] = strategy;
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