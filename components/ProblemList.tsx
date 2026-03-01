import {ProblemDescription} from "@/data/ProblemSpecificationTypes";

type ProblemListProps = {
    problems: ProblemDescription[],
    loadProblem: (problem: ProblemDescription) => void
}

export default function ProblemList({problems, loadProblem}: ProblemListProps) {
    return (
        <div>
            <div class="navbar flex items-center">
                <h1 className="flex-1 font-title text-heading text-2xl font-bold text-center mt-2">TIS-100 Problems</h1>
                <a href="/manual.pdf" target="_blank" rel="noopener noreferrer">Help</a>
            </div>
            <ol className="list grid">
                {problems.map(problem => <li onClick={() => loadProblem(problem)} key={problem.id} className="list-row flex">{problem.title}</li>)}
            </ol>
        </div>
    )
}