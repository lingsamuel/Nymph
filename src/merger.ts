import {PatchListStrategyType, PatchStrategyType} from "./type";
import {Operator} from "./operator/Operator";
import {StrategyOperator} from "./operator/StrategyOperator";
import {RemoveOperator} from "./operator/RemoveOperator";

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
        this.addOp(new StrategyOperator());
        this.addOp(new RemoveOperator());
        this.plugins = plugins;
        this.constructDatabase();
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
            op.apply(obj)
        })
    }

    private processArray() {
    }
}
