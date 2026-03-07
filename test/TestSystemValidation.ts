import {problemDescription as systemValidationProblemDescription} from "@/data/problems/SystemDiagnostic";
import {Interpreter} from "@/src/Interpreter";
import {getProblemLogic} from "@/data/ProblemLogicMapping";

const interpreter = new Interpreter(systemValidationProblemDescription, getProblemLogic(systemValidationProblemDescription.id));

interpreter.updateInstructions({x: 0, y: 1}, ["MOV UP DOWN"]);
interpreter.updateInstructions({x: 0, y: 2}, ["MOV UP DOWN"]);
interpreter.updateInstructions({x: 0, y: 3}, ["MOV UP DOWN"]);

while (!interpreter.completed()) {
    interpreter.printNodes();
    interpreter.step();
    console.log();
}