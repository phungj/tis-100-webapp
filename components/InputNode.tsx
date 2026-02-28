import {InputNodeState} from "@/src/Interpreter";

type InputNodeProps = {
    inputNodeState: InputNodeState
}

// TODO: Update with highlighting of the current input
// TODO: Update with named inputs
export default function InputNode({inputNodeState}: InputNodeProps) {
    return (
        <div>
            <h1 className="font-title text-heading text-2xl font-bold text-center">Input</h1>
            <ol className="list grid border-4 border-white">
                {inputNodeState.data.map((n, i) => <li key={i} className={i === inputNodeState.dataPointer ? "bg-gray-500" : ""}>{n}</li>)}
            </ol>
        </div>
    )
}