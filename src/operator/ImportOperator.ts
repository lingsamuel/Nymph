import {Operator} from "./Operator";

export class ImportOperator extends Operator {

    op(): "$import" {
        return "$import";
    }

    apply(base: any, patch: any): any {
        const ref = patch[this.op()];
        console.log("import", patch)
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

        for (let key of Object.keys(refObject)) {
            if (key.startsWith("$")) {
                continue;
            }
            if (patch[key] == undefined) {
                patch[key] = refObject[key];
            }
        }
        return patch;
    }
}