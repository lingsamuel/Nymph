import {AttributesFlagOperator} from "./AttributesFlagOperator";

export type AttributesKeepDef = {
    "$keep": string[]
}

export class AttributesKeepOperator extends AttributesFlagOperator {
    op(): string {
        return "$keep";
    }
}
