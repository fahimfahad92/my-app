import Link from "next/link";
import {Home} from "lucide-react";

export default function HomeComponent() {
    return <>
        {/* Home navigation */}
        <div className="w-auto">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2">
                <Home className="w-4 h-4 mr-2"/>
                <span>Back to Home</span>
            </Link>
        </div>
    </>;
}