import {Operator} from "./Operator";
import {isObject} from "../type";
import {logger} from "../merger";

export class ImportOperator extends Operator {

    op(): "$import" {
        return "$import";
    }

    apply(base: any, patch: any): any {
        // Get the reference
        const ref = patch[this.op()];
        if (ref == undefined) {
            return patch;
        }
        const foundObject = this.merger.parseReference(ref) as any[];
        if (foundObject == undefined) {
            return patch;
        }
        let refObject;
        if (Array.isArray(foundObject)) {
            if (foundObject.length == 0) {
                return patch;
            }
            refObject = foundObject[0];
        } else {
            refObject = foundObject;
        }

        // Import
        let pickKeys = Object.keys(refObject);
        if (patch["$import-no-pick"] != undefined && Array.isArray(patch["$import-no-pick"])) {
            pickKeys = pickKeys.filter(x => !patch["$import-no-pick"].includes(x));
        }
        if (patch["$import-pick"] != undefined && Array.isArray(patch["$import-pick"])) {
            pickKeys = patch["$import-pick"];
        }
        let importStrategy = patch["$import-strategy"]
        if (importStrategy == undefined || !isObject(patch["$import-strategy"])) {
            importStrategy = {};
        }

        for (let key of pickKeys) {
            if (key.startsWith("$") || refObject[key] == undefined) {
                continue;
            }
            if (patch[key] == undefined) {
                patch[key] = refObject[key];
                if (importStrategy[key] != undefined && typeof importStrategy[key] == "string") {
                    if (isObject(patch[key])) {
                        patch[key]["$strategy"] = importStrategy[key];
                    } else if (Array.isArray(patch[key])) {
                        patch[key] = {
                            "$list-strategy": importStrategy[key],
                            "$value": patch[key],
                        }
                    } else {
                        logger.log(`Cannot apply strategy ${importStrategy[key]} to type ${typeof patch[key]} (key ${key})`)
                    }
                }
            }
        }
        return patch;
    }
}