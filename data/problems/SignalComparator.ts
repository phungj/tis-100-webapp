import {ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import type {Seed} from "@/data/ProblemSpecificationTypes";
import {GRID_HEIGHT, MIN_VALUE, MAX_VALUE, Data, GRID_WIDTH} from "@/src/Interpreter";

// TODO: Stop exporting the individual components once you get loading in
// TODO: Also review code warning and remove code warnings like unused code
export const problemDescription: ProblemDescription = {
    id: "signal-comparator",
    order: 3,
    title: "Signal Comparator",
    description: "For each input:\nWrite 1 to OUT.G if IN > 0\nWrite 1 to OUT.E if IN = 0\n Write 1 to OUT.L if IN < 0\nWhen a 1 is not outputted, output 0 instead",
    seed: 31415,
    inputNodes: {
        inputNodeCoordinates: [{x: 0, y: 0}, {x: GRID_WIDTH - 1, y: 0}],
        inputValues: [[[-2, -1, 0, 1, 2]]],
        inputNames: [""]
    },
    outputNodes: {
        outputNodeCoordinates: [{x: 1, y: 3}, {x: 2, y: 3}, {x: GRID_WIDTH - 1, y: 3}],
        outputNames: ["G", "E", "L"]
    },
    brokenNodes: [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}],
    stackNodes: []
};