import {FlagOperator} from "./FlagOperator";

export class RemoveOperator extends FlagOperator {
    op(): string {
        return "$remove";
    }

    action(base: any, patch: any, flaggedProps: string[], currentProp: string) {
        delete base[currentProp];
    }
}
