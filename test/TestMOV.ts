import {problemDescription as systemValidationProblemDescription} from "@/data/problems/SystemDiagnostic";
import {Interpreter} from "@/src/Interpreter";
import {getProblemLogic} from "@/data/ProblemLogicMapping";

const interpreter = new Interpreter(systemValidationProblemDescription, getProblemLogic(systemValidationProblemDescription.id));

interpreter.updateInstructions({x: 0, y: 1}, ["MOV ACC DOWN"], false);
interpreter.updateInstructions({x: 0, y: 2}, ["MOV UP DOWN"], false);
interpreter.updateInstructions({x: 0, y: 3}, ["MOV UP DOWN"], false);

for (let i = 0; i < 5; i++) {
    interpreter.printNodes();
    interpreter.step();
    console.log();
}