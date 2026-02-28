import {ProblemDescription} from "@/data/ProblemSpecificationTypes";

type ProblemDescriptionProps = {
    problemDescription: ProblemDescription
}

export default function ProblemDescriptionComponent({problemDescription}: ProblemDescriptionProps) {
    return (
        <div className="border-4 border-white">
            <h1 className="font-title text-heading text-2xl font-bold text-center">{problemDescription.title}</h1>
            <h2>{problemDescription.description}</h2>
        </div>
    )
}