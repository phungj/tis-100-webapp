import {problemDescription as systemValidationProblemDescription, problemLogic as systemValidationProblemLogic} from "@/data/problems/SystemValidation";
import {Interpreter} from "@/src/Interpreter";

const interpreter = new Interpreter(systemValidationProblemDescription, systemValidationProblemLogic);

interpreter.updateInstructions({x: 0, y: 1}, ["MOV UP DOWN"]);
interpreter.updateInstructions({x: 0, y: 2}, ["MOV UP DOWN"]);
interpreter.updateInstructions({x: 0, y: 3}, ["MOV UP DOWN"]);

for (let i = 0; i < 5; i++) {
    interpreter.printNodes();
    interpreter.step();
    console.log();
}

interpreter.printNodes();

// TODO: Implement literal handling for reading
// TODO: Update error types to include node coordinates and instruction pointer
// TODO: Implement completed and wrong functions for interpreter
// TODO: Completed returns true if done
// TODO: Wrong returns indices of mismtaching values
// TODO: Implement a basic frontend from this