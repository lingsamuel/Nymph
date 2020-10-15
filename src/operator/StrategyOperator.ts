import {logger} from "../merger";
import {Operator} from "./Operator";
import {isObject} from "../type";

export class StrategyOperator extends Operator {
    // Strategy Operator process basic properties changes
    op(): string {
        return "$strategy";
    }

    mergeList(base: any[], patch: {
        "$value": any[]
    } & any) {
        let strategy = patch["$strategy-list"];
        if (strategy == undefined) {
            strategy = "append";
            patch["$strategy-list"] = strategy;
        }
        if (strategy == "replace") {
            return patch["$value"];
        }
        if (strategy == "append") {
            return base.concat(patch["$value"])
        } else if (strategy == "prepend") {
            return patch["$value"].concat(base)
        } else {
            logger.log(`Unknown strategy-list ${strategy}`);
        }
    }

    apply(obj: { base: any; patches: any[] }): any {
        let base = obj.base;
        for (let patch of obj.patches) {
            let strategy = patch[this.op()];
            if (strategy == undefined) {
                strategy = "merge";
                patch[this.op()] = strategy;
            }
            if (strategy == "merge") {
                // 合并
                for (let key of Object.keys(patch)) {
                    if (key.startsWith("$")) {
                        continue;
                    }
                    let baseProp = base[key];
                    let patchProp = patch[key];
                    if (isObject(baseProp) && isObject(patchProp)) {
                        this.merger.mergeRecord({
                            base: baseProp,
                            patches: [
                                patchProp,
                            ]
                        })
                    } else if (Array.isArray(baseProp)) {
                        if (Array.isArray(patchProp)) {
                            base[key].push(...patchProp)
                        } else if (isObject(patchProp)) {
                            // 处理 $strategy-list 等
                            base[key] = this.mergeList(baseProp, patchProp)
                        } else {
                            logger.log(`Cannot merge ${patchProp} to array (key: ${key})`);
                        }
                    } else {
                        base[key] = patch[key];
                    }
                }
            } else if (strategy == "replace") {
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
            }
        }
        return base;
    }


}
