import {Operator} from "./Operator";
import {MergeDef, MergeOperator} from "./MergeOperator";
import {isObject} from "../type";
import {KeepDef, KeepOperator} from "./KeepOperator";
import {RemoveDef, RemoveOperator} from "./RemoveOperator";

export class ObjectOperator extends Operator {
    op(): string {
        return "";
    }

    apply(base: any, patch: Partial<MergeDef & KeepDef & RemoveDef>): any {
        if (patch == undefined || (isObject(patch) && Object.keys(patch).length == 0)) {
            return base;
        }
        base = this.newOp(MergeOperator).apply(base, patch as MergeDef);
        base = this.newOp(KeepOperator).apply(base, patch as KeepDef);
        base = this.newOp(RemoveOperator).apply(base, patch as RemoveDef);
        return base;
    }
}