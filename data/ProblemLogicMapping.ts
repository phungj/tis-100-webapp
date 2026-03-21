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
        case "differential-converter":
            // TODO:
            return {
                generateInputs: (seed: Seed) => [[]],
                computeExpectedOutput: (input: Data[], outputIndex) => input[0].map(outputIndex == 0 ? (x, i) => x - input[1][i] : (x, i) => input[1][i] - x)
            }
        case "signal-comparator":
            // TODO:
            return {
                generateInputs: (seed: Seed) => [[]],
                computeExpectedOutput: (input: Data[], outputIndex) => {
                    switch (outputIndex) {
                        case 0:
                            input[0].map((i) => )
                    }
                }
            }
        default:
            throw new IllegalArgumentError(`Problem with ID ${problemID} not found.  If you see this, please tell Jon!`);
    }
}