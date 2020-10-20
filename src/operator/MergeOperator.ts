import {logger, NymphDataObject, NymphDataType, NymphPatchObject, NymphWrappedDataType} from "../merger";
import {Operator} from "./Operator";
import {ListMergeOperator} from "./ListMergeOperator";
import {isArray, isObject, isPrimitive} from "../type";
import {ObjectOperator} from "./ObjectOperator";


export type MergeStrategyType = "merge" | "replace" | "replace-exist" | "add-new";

export type MergeDef = {
    "$strategy"?: MergeStrategyType,
}

export type ImportDef = {
    "$import"?: string,
}

export type PropertyKeepDef = {
    "$keep"?: "ref" | "exist",
    "$keep-ref"?: string,
}

export class MergeOperator extends Operator {
    op(): "$strategy" {
        return "$strategy";
    }

    apply(base: NymphPatchObject, patch: NymphDataObject & MergeDef): NymphPatchObject {
        let strategy = patch[this.op()];
        if (strategy == undefined) {
            strategy = "merge";
        }
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
                } else if (isPrimitive(baseProp) && isObject(patchProp)) {
                    // base value is primitive，patch value is object，possible $import/$remove/$keep/$keep-ref
                    const validProperties = ["$value", "$remove", "$keep", "$keep-ref"];
                    let containsValidProp = false;
                    for (let validProperty of validProperties) {
                        if (patchProp[validProperty]) {
                            containsValidProp = true;
                            break;
                        }
                    }
                    if (!containsValidProp) {
                        logger.log(`[StrategyOperator] Unknown patch ${patchProp} to ${baseProp}. Key ${key}.`);
                        continue;
                    }
                    // base prop turns to be a obj
                    const wrapped: NymphWrappedDataType = {
                        "$value": baseProp,
                    }
                    if (patchProp["$value"] != undefined) {
                        wrapped["$value"] = patchProp["$value"];
                    }
                    if (patchProp["$keep"] == "exist") {
                        wrapped["$keep"] = patchProp["$keep"];
                        // if (typeof wrapped["$keep"] == "string") {
                        //     wrapped["$keep"] = "exist";
                        // }
                    } else if (/*patchProp["$keep"] == "ref" && */patchProp["$keep-ref"] != undefined) {
                        if (typeof patchProp["$keep-ref"] != "string") {
                            logger.log(`Operator keep-ref ${patchProp["$keep-ref"]} should be string`);
                            return base;
                        }
                        wrapped["$keep"] = "ref";
                        wrapped["$keep-ref"] = patchProp["$keep-ref"];
                    }
                    const removeOp = patchProp["$remove"];
                    if (removeOp != undefined) {
                        wrapped["$remove"] = patchProp["$remove"];
                    }

                    base[key] = wrapped;
                } else if (isPrimitive(baseProp) && isPrimitive(patchProp)) {
                    // both are primitive, replace
                    base[key] = patchProp;
                } else {
                    // other cases are invalid
                    logger.log(`Cannot merge ${patchProp} to ${baseProp}`);
                    continue;
                }
            }
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
