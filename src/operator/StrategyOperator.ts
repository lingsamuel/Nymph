import {logger} from "../merger";
import {Operator} from "./Operator";
import {isObject} from "../type";

export class StrategyOperator extends Operator {
    // Strategy Operator process basic properties changes
    op(): string {
        return "$strategy";
    }

    apply(obj: { base: any; patches: any[] }): any {
        let base = obj.base;
        for (let patch of obj.patches) {
            const type = patch[this.op()];
            if (type == undefined || type == "merge") {
                // 合并
                for (let key of Object.keys(patch)) {
                    if (key.startsWith("$")) {
                        continue;
                    }

                    if (isObject(base[key]) && isObject(patch[key])) {
                        this.merger.mergeRecord({
                            base: base[key],
                            patches: [
                                patch[key],
                            ]
                        })
                    } else {
                        base[key] = patch[key];
                    }
                }
            } else if (type == "replace") {
                // 删除原 key
                for (let key of Object.keys(base)) {
                    if (key.startsWith("$")) {
                        continue;
                    }

                    delete base[key];
                }
                for (let key of Object.keys(patch)) {
                    base[key] = patch[key];
                }
            } else if (type == "replace-exist") {
                let existKeys: string[] = Object.keys(base);

                for (let key of Object.keys(patch)) {
                    if (key.startsWith("$")) {
                        continue;
                    }

                    if (existKeys.includes(key)) {
                        base[key] = patch[key];
                    }
                }
            } else if (type == "add-new") {
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
                logger.log(`Unknown strategy ${type}`)
            }
        }
        return base;
    }


}
