import {logger} from "../merger";
import {Operator} from "./Operator";
import {isObject} from "../type";
import {ListElementMatcherOperator} from "./ListMatcher";

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

        // 处理 list-operator
        let newList = patch["$value"];
        if (newList == undefined) {
            newList = []
        }

        if (patch["$list-remove"] != undefined) {
            const toRemove = patch["$list-remove"];
            if (typeof toRemove == "string" || Array.isArray(toRemove)) {
                const idx = this.merger.parseIndexer(toRemove)
                for (let i of idx) {
                    delete base[i]
                }
                base = base.filter(x => x != null)
            }
        }
        if (patch["$list-remove-matcher"] != undefined) {
            const matcher = new ListElementMatcherOperator(patch["$list-remove-matcher"])
            const idx = matcher.find(base);
            for (let i of idx) {
                delete base[i]
            }
            base = base.filter(x => x != null)
        }

        if (strategy == "append") {
            return base.concat(newList)
        } else if (strategy == "prepend") {
            return newList.concat(base)
        } else {
            logger.log(`Unknown strategy-list ${strategy}`);
        }
        return base;
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
                    if (baseProp == undefined) {
                        base[key] = patchProp;
                    } else if (isObject(baseProp) && isObject(patchProp)) {
                        // 原值与新值均为 object，合并
                        this.merger.mergeRecord({
                            base: baseProp,
                            patches: [
                                patchProp,
                            ]
                        })
                    } else if (Array.isArray(baseProp)) {
                        if (Array.isArray(patchProp)) {
                            // 原值是 array，新值是 array，应用默认策略 append
                            base[key].push(...patchProp)
                        } else if (isObject(patchProp)) {
                            // 原值是 array，新值是 object，处理 strategy-list operator
                            // 处理 $strategy-list 等
                            base[key] = this.mergeList(baseProp, patchProp)
                        } else {
                            // 其他情形均不合法
                            logger.log(`Cannot merge ${patchProp} to array (key: ${key})`);
                        }
                    } else if (!isObject(baseProp) && isObject(patchProp)) {
                        // 原值是基本类型，新值是 object，可能是 $import/$remove/$keep/$keep-ref
                        // 如果是 $import，应该置于 $value 下
                        const validProperties = ["$value", "$remove", "$keep", "$keep-ref"];
                        let containsValidProp = false;
                        for (let validProperty of validProperties) {
                            if (patchProp[validProperty]) {
                                containsValidProp = true;
                                break;
                            }
                        }
                        if (!containsValidProp) {
                            logger.log(`[StrategyOperator] Unknown patch ${patchProp} to ${baseProp}. Key ${key}.`);
                            return base;
                        }
                        // base prop turns to be a obj
                        base[key] = {
                            "$value": base[key],
                        }
                        if (patchProp["$value"] != undefined) {
                            base[key]["$value"] = patchProp["$value"];
                        }
                        if (patchProp["$keep"] != undefined) {
                            base[key]["$keep"] = patchProp["$keep"];
                            if (typeof base[key]["$keep"] == "string") {
                                base[key]["$keep"] = [base[key]["$keep"]];
                            }
                        } else if (patchProp["$keep-ref"] != undefined) {
                            base[key]["$keep-ref"] = patchProp["$keep-ref"];
                            if (typeof base[key]["$keep-ref"] == "string") {
                                base[key]["$keep-ref"] = [base[key]["$keep-ref"]];
                            }
                        }
                        if (patchProp["$remove"] != undefined) {
                            base[key] = {
                                "$remove": patchProp["$remove"],
                            }
                        }
                    } else if (!isObject(baseProp) && !isObject(patchProp)) {
                        // 均为基本类型，替换
                        base[key] = patchProp;
                    } else {
                        // 其他情形均不合法
                        logger.log(`Cannot merge ${patchProp} to ${baseProp}`);
                        return base;
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
                return base;
            }
        }
        return base;
    }


}
