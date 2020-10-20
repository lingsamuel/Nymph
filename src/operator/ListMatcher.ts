import {logger} from "../merger";

export type PrimitiveTypes = string | number;

export type Condition = {
    "$equals": PrimitiveTypes,
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

    match(obj: any): boolean {
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
} | PrimitiveTypes;

class Matcher {
    def: MatcherDef;

    constructor(def: MatcherDef) {
        this.def = def;
    }

    match(obj: any): boolean {
        let matched = true;

        // Primitive Types
        const objType = typeof obj;
        const primitiveTypes = ["string", "number"];
        if (primitiveTypes.includes(objType)) {
            if (typeof this.def != objType) {
                logger.log(`Cannot match ${obj} by ${this.def}`);
            }
            return obj == this.def;
        }

        // Object
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

    match(list: any[]): number[] {
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

    match(list: any[]): number[] {
        const result: number[] = [];
        this.matchers.map(op => op.match(list)).forEach(idx => result.push(...idx));
        return result;
    }
}