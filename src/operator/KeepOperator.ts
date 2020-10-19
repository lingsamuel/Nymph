import {FlagOperator} from "./FlagOperator";

export class KeepOperator extends FlagOperator {
    op(): string {
        return "$keep";
    }
}
