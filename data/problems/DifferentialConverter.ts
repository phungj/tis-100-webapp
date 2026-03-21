import {ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import type {Seed} from "@/data/ProblemSpecificationTypes";
import {GRID_HEIGHT, MIN_VALUE, MAX_VALUE, Data, GRID_WIDTH} from "@/src/Interpreter";

// TODO: Stop exporting the individual components once you get loading in
// TODO: Also review code warning and remove code warnings like unused code
export const problemDescription: ProblemDescription = {
    id: "differential-converter",
    order: 2,
    title: "Differential Converter",
    description: "For each pair of inputs from IN.X and IN.Y, output X - Y to OUT.P and Y - X to OUT.N",
    seed: 31415,
    inputNodes: {
        inputNodeCoordinates: [{x: 0, y: 0}, {x: GRID_WIDTH - 1, y: 0}],
        inputValues: [[[1, 2, 3, 4, 5], [5, 4, 3, 2, 1]]],
        inputNames: ["X", "Y"]
    },
    outputNodes: {
        outputNodeCoordinates: [{x: 0, y: GRID_HEIGHT - 1}, {x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1}],
        outputNames: ["P", "N"]
    },
    brokenNodes: [{x: GRID_WIDTH - 1, y: 2}],
    stackNodes: []
};