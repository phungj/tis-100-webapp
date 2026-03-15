import {problemDescription} from "@/data/problems/DifferentialConverter";
import {Interpreter} from "@/src/Interpreter";
import {getProblemLogic} from "@/data/ProblemLogicMapping";

const interpreter = new Interpreter(problemDescription, getProblemLogic(problemDescription.id));

interpreter.updateInstructions({x: 0, y: 1}, ["MOV UP ACC", "MOV ACC RIGHT", "MOV ACC RIGHT"]);
interpreter.updateInstructions({x: 1, y: 1}, ["MOV LEFT ACC", "SUB RIGHT", "MOV LEFT RIGHT", "MOV ACC DOWN"]);
interpreter.updateInstructions({x: 2, y: 1}, ["MOV RIGHT ACC", "MOV ACC LEFT", "SUB LEFT", "MOV ACC DOWN"]);
interpreter.updateInstructions({x: 3, y: 1}, ["MOV UP LEFT"]);
interpreter.updateInstructions({x: 1, y: 2}, ["MOV UP DOWN"]);
interpreter.updateInstructions({x: 2, y: 2}, ["MOV UP DOWN"]);
interpreter.updateInstructions({x: 0, y: 3}, ["MOV RIGHT DOWN"]);
interpreter.updateInstructions({x: 1, y: 3}, ["MOV UP LEFT"]);
interpreter.updateInstructions({x: 2, y: 3}, ["MOV UP RIGHT"]);
interpreter.updateInstructions({x: 3, y: 3}, ["MOV LEFT DOWN"]);

while (!interpreter.completed()) {
    interpreter.printNodes();
    interpreter.step();
    console.log();
}