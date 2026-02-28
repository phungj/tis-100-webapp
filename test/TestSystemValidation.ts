import {problemDescription as systemValidationProblemDescription, problemLogic as systemValidationProblemLogic} from "@/data/problems/SystemDiagnostic";
import {Interpreter} from "@/src/Interpreter";

const interpreter = new Interpreter(systemValidationProblemDescription, systemValidationProblemLogic);

interpreter.updateInstructions({x: 0, y: 1}, ["MOV UP DOWN"]);
interpreter.updateInstructions({x: 0, y: 2}, ["MOV UP DOWN"]);
interpreter.updateInstructions({x: 0, y: 3}, ["MOV UP DOWN"]);

while (!interpreter.completed()) {
    interpreter.printNodes();
    interpreter.step();
    console.log();
}

// TODO: Update error types to include node coordinates and instruction pointer
// TODO: Set up saving
// TODO: Update metadata in app folder