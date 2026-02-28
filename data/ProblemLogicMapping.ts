import {ProblemLogic, type Seed} from "@/data/ProblemSpecificationTypes";
import {Data} from "@/src/Interpreter";
import {IllegalArgumentError} from "@/src/Errors";

export function getProblemLogic(problemID: string): ProblemLogic {
    switch(problemID) {
        case "system-diagnostic":
            // TODO: Get seeds working as well
            return {
                generateInputs: (seed: Seed) => [Array.from({length: 5}, () => Math.floor(Math.random() * 1999) - 999)],
                computeExpectedOutput: (input: Data[], outputIndex) => input[0]
            }
        case "signal-amplifier":
            return {
                generateInputs: (seed: Seed) => [Array.from({length: 5}, () => Math.floor(Math.random() * 999) - 499)],
                computeExpectedOutput: (input: Data[], outputIndex) => input[0].map(n => n * 2)
            }
        default:
            throw new IllegalArgumentError(`Problem with ID ${problemID} not found`);
    }
}