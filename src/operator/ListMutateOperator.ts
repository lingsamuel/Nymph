import {Operator} from "./Operator";
import {ElementMatcher, ElementMatcherDef} from "./ListMatcher";
import {MergeOperator} from "./MergeOperator";
import {logger} from "../merger";

export type ListMutateDef = {
    "$list-mutate": ListMutateElementDef[],
    "$list-mutate-strategy": "fallback" | "remove",
}

type ListMutateElementDef = {
    "$value": any[],
    "$strategy": "replace" | "merge",
    "$source": number,
    "$to": ElementMatcherDef, // `-` means last. `-N` means N before last. Reference must be single, not range
} | {
    "$value": any[],
    "$strategy": "insert",
    "$source": number,
    "$to": ElementMatcherDef,
    "$insert-type": "before" | "after",
}

export class ListMutateOperator extends Operator {
    op():"$list-mutate" {
        return "$list-mutate";
    }

    apply(base: object[], patch: ListMutateDef): object[] {
        const mutateOps = patch[this.op()];
        if (mutateOps == undefined || !Array.isArray(mutateOps) || mutateOps.length == 0) {
            return base;
        }

        let processedIndexes: number[] = [];

        for (let mutateOp of mutateOps) {
            const matcher = new ElementMatcher(mutateOp["$to"]);
            const idx = matcher.match(base);
            if (idx == undefined || idx.length == 0) {
                continue;
            }
            const strategy = mutateOp["$strategy"];
            const patchObject = patch["$value"][mutateOp["$source"]];
            if (strategy == "replace") {
                base[idx[0]] = patchObject;
            } else if (strategy == "merge") {
                base[idx[0]] = this.newOp(MergeOperator).apply(base[idx[0]], patchObject);
            } else if (strategy == "insert") {
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
                logger.log(`Unknown strategy ${strategy}`)
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