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