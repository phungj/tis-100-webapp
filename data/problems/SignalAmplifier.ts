import {ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import type {Seed} from "@/data/ProblemSpecificationTypes";
import {GRID_HEIGHT, MIN_VALUE, MAX_VALUE, Data, GRID_WIDTH} from "@/src/Interpreter";

// TODO: Stop exporting the individual components once you get loading in
// TODO: Also review code warning and remove code warnings like unused code
export const problemDescription: ProblemDescription = {
    id: "signal-amplifier",
    order: 1,
    title: "Signal Amplifier",
    description: "Double each input value and output it.",
    seed: 31415,
    inputNodes: {
        inputNodeCoordinates: [{x: 0, y: 0}],
        inputValues: [[[1, 2, 3, 4, 5]]],
        inputNames: [""]
    },
    outputNodes: {
        outputNodeCoordinates: [{x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1}],
        outputNames: [""]
    },
    brokenNodes: [{x: GRID_WIDTH - 1, y: 1}, {x: 0, y: 3}],
    stackNodes: []
};