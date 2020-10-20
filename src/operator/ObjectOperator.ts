import {Operator} from "./Operator";
import {ObjectMergeDef, ObjectMergeOperator} from "./ObjectMergeOperator";
import {isObject} from "../type";
import {ObjectKeepDef, ObjectKeepOperator} from "./ObjectKeepOperator";
import {ObjectRemoveDef, ObjectRemoveOperator} from "./ObjectRemoveOperator";
import {NymphDataObject, NymphPatchObject} from "../merger";
import {ObjectKeepRefDef, ObjectKeepRefOperator} from "./ObjectKeepRefOperator";

export class ObjectOperator extends Operator {
    op(): string {
        return "";
    }

    apply(base: NymphPatchObject, patch: NymphDataObject & ObjectMergeDef & ObjectKeepDef & ObjectKeepRefDef & ObjectRemoveDef): NymphPatchObject {
        if (patch == undefined || (isObject(patch) && Object.keys(patch).length == 0)) {
            return base;
        }
        base = this.newOp(ObjectMergeOperator).apply(base, patch);
        base = this.newOp(ObjectKeepOperator).apply(base, patch);
        base = this.newOp(ObjectKeepRefOperator).apply(base, patch);
        base = this.newOp(ObjectRemoveOperator).apply(base, patch);
        return base;
    }
}