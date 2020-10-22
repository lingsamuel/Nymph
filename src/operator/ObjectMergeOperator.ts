import {logger, NymphDataObject, NymphDataType, NymphPatchObject} from "../merger";
import {Operator} from "./Operator";
import {ListMergeOperator} from "./ListMergeOperator";
import {isArray, isObject, isPrimitive} from "../type";
import {ObjectOperator} from "./ObjectOperator";
import {ImportOperator} from "./ImportOperator";


export type ObjectMergeStrategyType = "merge" | "merge-exist" | "replace" | "replace-exist" | "add-new";

export type ObjectMergeDef = {
    "$strategy"?: ObjectMergeStrategyType,
}

export type ImportDef = {
    "$import"?: string,
}

export class ObjectMergeOperator extends Operator {
    op(): "$strategy" {
        return "$strategy";
    }

    apply(base: NymphPatchObject, patch: NymphDataObject & ObjectMergeDef): NymphPatchObject {
        let strategy = patch[this.op()];
        if (strategy == undefined) {
            strategy = "merge";
        }
        patch = this.newOp(ImportOperator).apply(base, patch);
        if (strategy == "merge") {
            for (let key of Object.keys(patch)) {
                if (key.startsWith("$")) {
                    continue;
                }
                let baseProp: NymphDataType = base[key];
                let patchProp: NymphDataType = patch[key];
                if (baseProp == undefined) {
                    // base value doesn't exist, add to it
                    base[key] = patchProp;
                } else if (isObject(baseProp) && isObject(patchProp)) {
                    // base value and patch value both are object，applying merge
                    base[key] = this.newOp(ObjectOperator).apply(baseProp, patchProp);
                } else if (isArray(baseProp) && (isArray(patchProp) || isObject(patchProp))) {
                    // base value is array，patch value is object, applying list-merge
                    base[key] = this.newOp(ListMergeOperator).apply(baseProp, patchProp)
                } else if (isPrimitive(baseProp) && isPrimitive(patchProp)) {
                    // both are primitive, replace
                    base[key] = patchProp;
                } else {
                    // other cases are invalid
                    logger.log(`Cannot merge ${patchProp} to ${baseProp}`);
                    continue;
                }
            }
        } else if (strategy == "merge-exist") {
            let existKeys: string[] = Object.keys(base);

            let newPatch: NymphPatchObject = {}
            for (let key of Object.keys(patch)) {
                if (key.startsWith("$")) {
                    continue;
                }

                if (existKeys.includes(key)) {
                    newPatch[key] = patch[key];
                }
            }
            this.newOp(ObjectOperator).apply(base, newPatch);
        } else if (strategy == "replace") {
            for (let key of Object.keys(base)) {
                if (key.startsWith("$")) {
                    continue;
                }

                delete base[key];
            }
            for (let key of Object.keys(patch)) {
                base[key] = patch[key];
            }
        } else if (strategy == "replace-exist") {
            let existKeys: string[] = Object.keys(base);

            for (let key of Object.keys(patch)) {
                if (key.startsWith("$")) {
                    continue;
                }

                if (existKeys.includes(key)) {
                    base[key] = patch[key];
                }
            }
        } else if (strategy == "add-new") {
            let existKeys: string[] = Object.keys(base);

            for (let key of Object.keys(patch)) {
                if (key.startsWith("$")) {
                    continue;
                }

                if (!existKeys.includes(key)) {
                    base[key] = patch[key];
                }
            }
        } else {
            logger.log(`Unknown strategy ${strategy}`);
            return base;
        }
        return base;
    }


}
