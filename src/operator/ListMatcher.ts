import {logger, NymphDataType, NymphPatchObject, NymphPrimitiveType} from "../merger";
import {isObject, isPrimitive} from "../type";


type Condition = {
    "$equals": NymphPrimitiveType,
} | {
    "$includes": string,
}; /* | {
    "$script": string, // Valid variable: `target`, `self`
}*/

class ConditionOperator {
    key: string;
    def: Condition;

    constructor(key: string, def: Condition) {
        this.key = key;
        this.def = def;
    }

    match(obj: NymphPatchObject): boolean {
        const toMatch = obj[this.key];
        if (this.def["$equals"] != undefined && toMatch === this.def["$equals"]) {
            return true;
        } else if (this.def["$includes"] != undefined && typeof toMatch == "string" && toMatch.includes(this.def["$includes"])) {
            return true;
        }
        return false;
    }
}

export type MatcherDef = {
    [key: string]: Condition,
} | NymphPrimitiveType;

class Matcher {
    def: MatcherDef;

    constructor(def: MatcherDef) {
        this.def = def;
    }

    match(obj: NymphDataType): boolean {
        let matched = true;

        // Primitive Types
        if (isPrimitive(this.def)) {
            if (isPrimitive(obj)) {
                if (typeof this.def != typeof obj) {
                    logger.log(`Type mismatch: ${obj} vs ${this.def}`);
                }
                return obj == this.def;
            } else {
                logger.log(`Type mismatch: ${obj} vs ${this.def}`);
                return false;
            }
        }

        if (!isObject(obj)) {
            return false;
        }

        // Object Type
        const conds = Object.keys(this.def).map(x => {
            return new ConditionOperator(x, this.def[x]);
        });
        for (let cond of conds) {
            if (!cond.match(obj)) {
                matched = false;
                break;
            }
        }
        return matched;
    }
}

export type ElementMatcherStrategy = "first" | "last" | "all";

export type ElementMatcherDef = {
    "$matcher": MatcherDef,
    "$find-strategy": ElementMatcherStrategy,
};

export class ElementMatcher {
    findStrategy: ElementMatcherStrategy;
    matcher: Matcher;

    constructor(def: ElementMatcherDef) {
        this.findStrategy = def["$find-strategy"];
        this.matcher = new Matcher(def["$matcher"]);
    }

    match(list: NymphDataType[]): number[] {
        let matchedIndex: number[] = [];
        list.forEach((x, i) => {
            if (this.matcher.match(x)) {
                matchedIndex.push(i);
            }
        });

        if (this.findStrategy == "first") {
            return [matchedIndex[0]];
        } else if (this.findStrategy == "last") {
            return [matchedIndex[matchedIndex.length - 1]];
        } else {
            return matchedIndex;
        }
    }
}

export class ListElementMatcher {
    matchers: ElementMatcher[];

    constructor(defs: ElementMatcherDef[]) {
        this.matchers = defs.map(def => new ElementMatcher(def));
    }

    match(list: NymphDataType[]): number[] {
        const result: number[] = [];
        this.matchers.map(op => op.match(list)).forEach(idx => result.push(...idx));
        return result;
    }
}