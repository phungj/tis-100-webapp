import {loadProblems} from "@/data/LoadProblems";
import App from "@/components/App";

export default async function Page() {
    const problems = await loadProblems();

    return <App problems={problems}/>;
}