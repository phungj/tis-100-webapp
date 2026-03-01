import {ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import type {Seed} from "@/data/ProblemSpecificationTypes";
import {GRID_HEIGHT, MIN_VALUE, MAX_VALUE, Data, GRID_WIDTH} from "@/src/Interpreter";

// TODO: Stop exporting the individual components once you get loading in
// TODO: Also review code warning and remove code warnings like unused code
export const problemDescription: ProblemDescription = {
    id: "differential-converter",
    order: 2,
    title: "Differential Converter",
    description: "Output the difference of the left input and right input to the left output and the difference of the right input and the left input to the right output.",
    seed: 31415,
    inputNodes: [{x: 0, y: 0}, {x: GRID_WIDTH - 1, y: 0}],
    inputs: [[[1, 2, 3, 4, 5], [5, 4, 3, 2, 1]]],
    outputNodes: [{x: 0, y: GRID_HEIGHT - 1}, {x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1}],
    brokenNodes: [],
    stackNodes: []
};