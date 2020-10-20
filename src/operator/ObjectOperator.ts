import {Operator} from "./Operator";
import {MergeDef, MergeOperator} from "./MergeOperator";
import {isObject} from "../type";
import {ObjectKeepDef, KeepOperator} from "./KeepOperator";
import {RemoveDef, RemoveOperator} from "./RemoveOperator";
import {NymphDataObject, NymphPatchObject} from "../merger";

export class ObjectOperator extends Operator {
    op(): string {
        return "";
    }

    apply(base: NymphPatchObject, patch: NymphDataObject & MergeDef & ObjectKeepDef & RemoveDef): NymphPatchObject {
        if (patch == undefined || (isObject(patch) && Object.keys(patch).length == 0)) {
            return base;
        }
        base = this.newOp(MergeOperator).apply(base, patch);
        base = this.newOp(KeepOperator).apply(base, patch);
        base = this.newOp(RemoveOperator).apply(base, patch);
        return base;
    }
}