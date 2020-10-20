import {isObject} from "./type";
import {Operator} from "./operator/Operator";
import {MergeOperator} from "./operator/MergeOperator";
import {AttributesRemoveOperator} from "./operator/AttributesRemoveOperator";
import {AttributesKeepOperator} from "./operator/AttributesKeepOperator";

class Logger {
    log(...args: any[]) {
        console.log(args);
    }
}

export const logger = new Logger();

export class NymphObject {
    $id: string;
}

export class NymphPlugin {
    name: string;
    masters: string[] = [];
    objects: NymphObject[] = [];

    constructor(...objs: NymphObject[]) {
        this.objects = objs;
    }
    addObj(...objs: NymphObject[]) {
        this.objects.push(...objs);
    }
}

export class Nymph {
    operators: Operator[] = [];
    plugins: NymphPlugin[] = [];
    database: {
        [id: string]: {
            base: object,
            patches: object[],
        };
    } = {};

    processed: {
        [id: string]: object
    } = {};

    private addOp(op: Operator) {
        op.merger = this;
        this.operators.push(op);
    }

    constructor(...plugins: NymphPlugin[]) {
        this.addOp(new MergeOperator());
        this.addOp(new AttributesRemoveOperator());
        this.addOp(new AttributesKeepOperator());
        this.plugins = plugins;
        this.constructDatabase();
    }

    addPlugin(...plugins: NymphPlugin[]){
        this.plugins.push(...plugins);
    }

    private constructDatabase() {
        for (let plugin of this.plugins) {
            for (let obj of plugin.objects) {
                // construct base object and patches
                if (this.database[obj.$id] == undefined) {
                    this.database[obj.$id] = {
                        base: obj,
                        patches: [],
                    }
                } else {
                    this.database[obj.$id].patches.push(obj);
                }
            }
        }

        // Apply patches to base

        for (let id in this.database) {
            let obj = this.database[id];
            this.mergeRecord(obj);
        }

        // Apply operators between base
        for (let id in this.database) {
            let obj = this.database[id];
            let base = obj.base;
            for (let key of Object.keys(base)) {
                if (key.startsWith("$")) {
                    // need to be process
                }
            }
        }

        // Apply reference

        // Output
        for (let key in this.database) {
            this.processed[key] = this.database[key].base;
        }
    }

    mergeRecord(obj: {
        base: object,
        patches: object[],
    }) {
        this.operators.forEach((op) => {
            op.apply(obj.base, obj.patches)
        })
    }

    private processArray() {
    }

    parseIndexer(ref: string | string[]): number[] {
        let indexer = "";
        if (Array.isArray(ref)) {
            let indexes = []
            for (let r of ref) {
                if (r.includes("/")) { // /0,1,2
                    indexes.push(r.split("/")[1].trim())
                } else if (r.includes(",")) { // 0,1,2
                    indexes.push(r.trim())
                } else if (!isNaN(+r)) {
                    indexes.push(r)
                }
            }
            indexer = indexes.join(",")
        } else if (ref.includes("/")) {
            indexer = ref.split("/")[1].trim();
        } else if (ref.includes(",")) {
            indexer = ref.trim()
        } else if (!isNaN(+ref)) {
            indexer = ref
        }

        if (indexer != "") {
            const indexAccessors = indexer.split(",")
            let includeIndexes = []
            let excludeIndexes = []
            for (let indexAccessor of indexAccessors) {
                let exclusion = false;
                if (indexAccessor.startsWith("!")) {
                    exclusion = true
                    indexAccessor = indexAccessor.substring(1)
                }
                const indexes = []
                if (indexAccessor.includes("-")) {
                    // range
                    const start = parseInt(indexAccessor.split("-")[0])
                    const end = parseInt(indexAccessor.split("-")[1])
                    for (let i = start; i <= end; i++) {
                        indexes.push(i)
                    }
                } else {
                    indexes.push(parseInt(indexAccessor))
                }
                if (exclusion) {
                    excludeIndexes.push(...indexes)
                } else {
                    includeIndexes.push(...indexes)
                }
            }

            includeIndexes = includeIndexes.filter((val, i, arr) => arr.indexOf(val) === i);
            excludeIndexes = excludeIndexes.filter((val, i, arr) => arr.indexOf(val) === i);
            includeIndexes = includeIndexes.filter((val) => !excludeIndexes.includes(val))
            return includeIndexes
        }
        return []
    }

    parseReference(ref: string): any {
        const id = ref.split("#")[0]
        const accessor = ref.split("#")[1]
        const path = accessor.split(".")
        path[path.length - 1] = path[path.length - 1].split("/")[0]

        let obj = this.database[id]
        for (let key of path) {
            if (obj[key] == undefined) {
                return {}
            }
            obj = obj[key]
        }
        if (isObject(obj)) {
            return obj
        } else if (Array.isArray(obj)) {
            let includeIndexes = this.parseIndexer(ref)
            let result = []
            for (let i of includeIndexes) {
                if (obj.length > i) {
                    result.push(obj[i])
                }
            }
            return result
        } else {
            logger.log(`Unknown status: ${obj}`)
        }
        return []
    }
}
