import {JSX} from "react";

type ComputationNodeItemProps = {
    name: string,
    value: string
}

// TODO: style the sizes appropriately
// TODO: Make background black
// TODO: Add white borders
export default function ComputationNodeItem({ name, value }: ComputationNodeItemProps): JSX.Element {
    return (
        <div className="flex flex-1 flex-col items-center justify-center border-4 border-white">
            <h1 className="font-title text-heading text-2xl font-bold text-center">{name}</h1>
            <h2>{value}</h2>
        </div>
    );
}