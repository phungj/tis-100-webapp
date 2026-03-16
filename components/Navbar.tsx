import Link from "next/link";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle, faHome} from '@fortawesome/free-solid-svg-icons'


type NavbarProps = {
    homeButtonHandler: () => void
}

export default function Navbar({homeButtonHandler}: NavbarProps) {
    return (
        <div className="navbar flex items-center">
            <FontAwesomeIcon icon={faHome} size="2xl" onClick={homeButtonHandler}/>
            <h1 className="flex-1 font-title text-heading text-2xl font-bold text-center mt-2">TIS-100</h1>
            <Link href="/manual.pdf" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faQuestionCircle} size="2xl"/></Link>
        </div>
    );
}