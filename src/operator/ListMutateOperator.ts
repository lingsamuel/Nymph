import {Operator} from "./Operator";
import {ElementMatcher, ElementMatcherDef} from "./ListMatcher";
import {ObjectMergeOperator} from "./ObjectMergeOperator";
import {logger, NymphDataType} from "../merger";
import {isArray, isObject, isPrimitive} from "../type";
import {ListMergeOperator} from "./ListMergeOperator";
import {ListOpDef} from "./ListOperator";

type ListMutateElementDef = ListOpDef & ({
    "$strategy": "replace" | "merge",
    "$source": number,
    "$to": ElementMatcherDef, // `-` means last. `-N` means N before last. Reference must be single, not range
} | {
    "$strategy": "insert",
    "$source": number,
    "$to": ElementMatcherDef,
    "$insert-type": "before" | "after",
})

export type ListMutateDef = ListOpDef & {
    "$list-mutate"?: ListMutateElementDef[],
    "$list-mutate-strategy"?: "fallback" | "remove",
}

export class ListMutateOperator extends Operator {
    op(): "$list-mutate" {
        return "$list-mutate";
    }

    apply(base: NymphDataType[], patch: ListMutateDef): NymphDataType[] {
        const mutateOps = patch[this.op()];
        if (mutateOps == undefined || !Array.isArray(mutateOps) || mutateOps.length == 0) {
            return base;
        }

        let processedIndexes: number[] = [];

        if (patch["$value"] == undefined || !isArray(patch["$value"]) || patch["$value"].length == 0) {
            return base;
        }

        for (let mutateOp of mutateOps) {
            const matcher = new ElementMatcher(mutateOp["$to"]);
            const idx = matcher.match(base);
            if (idx == undefined || idx.length == 0) {
                continue;
            }
            const patchObject = patch["$value"][mutateOp["$source"]];
            if (mutateOp["$strategy"] == "replace") {
                base[idx[0]] = patchObject;
            } else if (mutateOp["$strategy"] == "merge") {
                const baseValue = base[idx[0]];
                if (isObject(baseValue)) {
                    base[idx[0]] = this.newOp(ObjectMergeOperator).apply(baseValue, patchObject);
                } else if (isArray(baseValue)) {
                    base[idx[0]] = this.newOp(ListMergeOperator).apply(baseValue, patchObject);
                } else if (isPrimitive(baseValue)) {
                    base[idx[0]] = patchObject;
                }
            } else if (mutateOp["$strategy"] == "insert") {
                const insertType = mutateOp["$insert-type"];
                if (insertType == "before") {
                    base.splice(idx[0], 0, patchObject);
                } else if (insertType == "after") {
                    base.splice(idx[idx.length - 1] + 1, 0, patchObject);
                } else {
                    logger.log(`Unknown insert-type ${insertType}`);
                    continue;
                }
            } else {
                logger.log(`Unknown strategy ${mutateOp["$strategy"]}`)
                continue;
            }
            processedIndexes.push(mutateOp["$source"]);
        }

        if (patch["$list-mutate-strategy"] == "remove") {
            patch["$value"] = [];
        } else {
            for (let i of processedIndexes) {
                delete patch["$value"][i];
            }
            patch["$value"] = patch["$value"].filter(x => x != null)
        }
        return base;
    }
}