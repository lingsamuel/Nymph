import {Operator} from "./Operator";
import {ElementMatcher, ElementMatcherDef} from "./ListMatcher";
import {MergeOperator} from "./MergeOperator";
import {logger} from "../merger";

export type ListMutateDef = {
    "$list-mutate": ListMutateElementDef[],
    "$list-mutate-strategy": "fallback" | "remove",
}

type ListMutateElementDef = {
    "$strategy": "replace" | "merge",
    "$source": number,
    "$to": ElementMatcherDef, // `-` means last. `-N` means N before last. Reference must be single, not range
} | {
    "$strategy": "insert",
    "$source": number,
    "$to": ElementMatcherDef,
    "$insert-type": "before" | "after",
}

export class ListMutateOperator extends Operator {
    op(): string {
        return "$list-mutate";
    }

    apply(base: object[], patch: {
        "$value": any[]
    } & ListMutateDef): object[] {
        const op: ListMutateElementDef[] = patch[this.op()];
        if (op == undefined || !Array.isArray(op) || op.length == 0) {
            return base;
        }

        let processedValue: number[] = [];

        for (let opElement of op) {
            const matcher = new ElementMatcher(opElement["$to"])
            const idx = matcher.match(base);
            if (idx == undefined || idx.length == 0) {
                continue;
            }
            const strategy = opElement["$strategy"];
            const patchObject = patch["$value"][opElement["$source"]];
            if (strategy == "replace") {
                base[idx[0]] = patchObject;
            } else if (strategy == "merge") {
                base[idx[0]] = this.newOp(MergeOperator).apply(base[idx[0]], [patchObject]);
            } else if (strategy == "insert") {
                const insertType = opElement["$insert-type"];
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
            processedValue.push(opElement["$source"]);
        }

        if (patch["$list-mutate-strategy"] == "remove") {
            patch["$value"] = [];
        } else {
            for (let i of processedValue) {
                delete patch["$value"][i];
            }
            patch["$value"] = patch["$value"].filter(x => x != null)
        }
        return base;
    }
}