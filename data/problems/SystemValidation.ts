import {ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import type {Seed} from "@/data/ProblemSpecificationTypes";
import {GRID_HEIGHT, MIN_VALUE, MAX_VALUE, Data} from "@/src/Interpreter";

export const problemDescription: ProblemDescription = {
    id: "system-validation",
    title: "System Validation",
    description: "Send the input to the output.",
    seed: 31415,
    inputNodes: [{x: 0, y: 0}],
    inputs: [[[1, 2, 3, 4, 5]]],
    outputNodes: [{x: 0, y: GRID_HEIGHT - 1}],
    brokenNodes: [],
    stackNodes: []
};

export const problemLogic: ProblemLogic = {
    generateInputs: (seed: Seed) => [Array.from({length: 5}, () => Math.floor(Math.random() * 1999) - 999)],
    computeExpectedOutput: (input: Data[]) => input[0]
}