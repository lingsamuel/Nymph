import {isObject} from "./type";
import {ObjectOperator} from "./operator/ObjectOperator";
import {ObjectKeepDef} from "./operator/ObjectKeepOperator";
import {ListMutateDef} from "./operator/ListMutateOperator";
import {ListRemoveDef} from "./operator/ListRemoveOperator";
import {ListRemoveMatchDef} from "./operator/ListRemoveMatchOperator";
import {ListMergeDef} from "./operator/ListMergeOperator";
import {ImportDef, ObjectMergeDef} from "./operator/ObjectMergeOperator";
import {ObjectRemoveDef} from "./operator/ObjectRemoveOperator";
import {ObjectKeepRefDef} from "./operator/ObjectKeepRefOperator";

class Logger {
    log(...args: any[]) {
        console.log(args);
    }
}

export const logger = new Logger();

export type NymphPrimitiveType = number | string | boolean;

export type NymphDataType = NymphPrimitiveType | NymphDataType[] | NymphPatchObject;

export type NymphOperatorType = ObjectMergeDef & ImportDef & ObjectRemoveDef & ObjectKeepDef & ObjectKeepRefDef &
    ListMergeDef & ListMutateDef & ListRemoveDef & ListRemoveMatchDef;

export type NymphObjectPropertyFlag = {
    "$remove-prop"?: string[],
    "$keep-prop"?: string[],
    "$keep-ref-prop"?: {
        [key: string]: string,
    },
}

export type NymphDataObject = {
    [key: string]: NymphDataType;
}

export type NymphPatchObject = NymphDataObject & NymphOperatorType & NymphObjectPropertyFlag;

export type NymphObject = {
    $id: string;
} & NymphPatchObject;

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
    plugins: NymphPlugin[] = [];
    database: {
        [id: string]: {
            base: NymphPatchObject,
            patches: NymphPatchObject[],
        };
    } = {};

    processed: {
        [id: string]: NymphPatchObject,
    } = {};

    constructor(...plugins: NymphPlugin[]) {
        this.plugins = plugins;
        this.constructDatabase();
    }

    addPlugin(...plugins: NymphPlugin[]) {
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
            this.database[id].base = this.applyPlugin(this.database[id].base, this.database[id].patches);
        }

        // Apply operators between base
        // for (let id in this.database) {
        //     let obj = this.database[id];
        //     let base = obj.base;
        //     for (let key of Object.keys(base)) {
        //         if (key.startsWith("$")) {
        //             // need to be process
        //         }
        //     }
        // }

        // Apply reference

        // Output
        for (let key in this.database) {
            this.processed[key] = this.database[key].base;
        }
    }

    applyPlugin(base: NymphPatchObject, patches: NymphPatchObject[]): NymphPatchObject {
        const op = new ObjectOperator();
        op.merger = this;

        for (let patch of patches) {
            base = op.apply(base, patch);
        }
        return base;
    }

    private processArray() {
    }

    parseIndexer(ref: string | string[]): number[] {
        let indexer = "";
        if (Array.isArray(ref)) {
            let indexes: string[] = []
            for (let r of ref) {
                if (r.includes("/")) { // /0,1,2
                    indexes.push(r.split("/")[1].trim())
                } else if (r.includes(",")) { // 0,1,2
                    indexes.push(r.trim())
                } else if (!isNaN(+r)) { // 0
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
            let includeIndexes: number[] = []
            let excludeIndexes: number[] = []
            for (let indexAccessor of indexAccessors) {
                if (indexAccessor == "") {
                    continue;
                }
                let exclusion = false;
                if (indexAccessor.startsWith("!")) {
                    exclusion = true
                    indexAccessor = indexAccessor.substring(1)
                }
                const indexes: number[] = []
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
                    excludeIndexes.push(...indexes);
                } else {
                    includeIndexes.push(...indexes);
                }
            }

            includeIndexes = includeIndexes.filter((val, i, arr) => arr.indexOf(val) === i);
            excludeIndexes = excludeIndexes.filter((val, i, arr) => arr.indexOf(val) === i);
            includeIndexes = includeIndexes.filter((val) => !excludeIndexes.includes(val))
            return includeIndexes
        }
        return []
    }

    parseReference(ref: string): NymphDataType {
        if (!ref.includes("#")) {
            return this.database[ref].base;
        }
        const id = ref.split("#")[0]
        const accessor = ref.split("#")[1]
        const path = accessor.split(".")
        path[path.length - 1] = path[path.length - 1].split("/")[0]

        let obj: NymphDataType = this.database[id].base;
        for (let key of path) {
            if (!isObject(obj) || obj[key] == undefined) {
                return {}
            }
            obj = obj[key];
        }
        if (isObject(obj)) {
            return obj
        } else if (Array.isArray(obj)) {
            let includeIndexes = this.parseIndexer(ref)
            let result: NymphDataType[] = []
            for (let i of includeIndexes) {
                if (obj.length > i) {
                    result.push(obj[i]);
                }
            }
            return result
        } else {
            logger.log(`Unknown status: ${obj}`)
        }
        return []
    }
}
