import {Condition, ListMatcher, ListMatcherStrategy, Matcher} from "../type";
import {logger} from "../merger";

class ConditionOperator {
    key: string;
    def: Condition;

    constructor(key: string, def: Condition) {
        this.key = key;
        this.def = def;
    }

    match(obj: any): boolean {
        if (obj[this.key] === this.def["$equals"]) {
            return true;
        }
        return false;
    }
}

class ObjectMatcherOperator {
    def: Matcher;

    constructor(def: Matcher) {
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

export class ElementMatcherOperator {
    foundStrategy: ListMatcherStrategy;
    matcher: ObjectMatcherOperator;

    constructor(def: ListMatcher) {
        this.foundStrategy = def["$find-strategy"];
        this.matcher = new ObjectMatcherOperator(def["$matcher"]);
    }

    find(list: any[]): number[] {
        let matchedIndex: number[] = [];
        list.forEach((x, i) => {
            if (this.matcher.match(x)) {
                matchedIndex.push(i);
            }
        });

        if (this.foundStrategy == "first") {
            return [matchedIndex[0]];
        } else if (this.foundStrategy == "last") {
            return [matchedIndex[matchedIndex.length - 1]];
        } else {
            return matchedIndex;
        }
    }
}

export class ListElementMatcherOperator {
    matcher: ElementMatcherOperator[];

    constructor(def: ListMatcher[]) {
        this.matcher = def.map(x => new ElementMatcherOperator(x));
    }

    find(list: any[]): number[] {
        const result: number[] = [];
        this.matcher.map(op => op.find(list)).forEach(idx => result.push(...idx));
        return result;
    }
}