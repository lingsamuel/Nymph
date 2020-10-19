import {AttributesFlagOperator} from "./AttributesFlagOperator";

export type AttributesRemoveDef = {
    "$remove": string[],
}

export class AttributesRemoveOperator extends AttributesFlagOperator {
    op(): string {
        return "$remove";
    }

    action(base: any, patch: AttributesRemoveDef, flaggedProps: string[], currentProp: string) {
        delete base[currentProp];
    }
}
