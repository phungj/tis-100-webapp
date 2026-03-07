import {ProblemDescription} from "@/data/ProblemSpecificationTypes";
import Navbar from "@/components/Navbar";

type ProblemListProps = {
    problems: ProblemDescription[],
    loadProblem: (problem: ProblemDescription) => void
}

export default function ProblemList({problems, loadProblem}: ProblemListProps) {
    return (
        <div>
            <Navbar homeButtonHandler={() => {}}/>
            <ol className="list grid">
                {problems.map(problem => <li onClick={() => loadProblem(problem)} key={problem.id} className="list-row flex">{problem.title}</li>)}
            </ol>
        </div>
    )
}