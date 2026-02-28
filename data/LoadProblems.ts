import fs from "fs";
import path from "path";
import {ProblemDescription} from "@/data/ProblemSpecificationTypes";

export async function loadProblems(): Promise<ProblemDescription[]> {
    const files = fs.readdirSync(path.join(process.cwd(), "data/problems"));

    return files.map(file => {
        const problem = require(`./problems/${file}`);

        return problem.problemDescription;
    });
}