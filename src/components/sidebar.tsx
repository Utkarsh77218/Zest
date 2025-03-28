import Image from "next/image";
import Link from "next/link";

import { Navigation } from "./navigation";
import { DottedSeparator } from "./dotted-separator";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Projects } from "./projects";

export const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <Link href="/" className='flex items-center rounded-md'>
                 <Image src="/logo.svg" alt="logo" height={46} width={48} /><p className='ml-2 font-bold text-xl'>Zest</p>
            </Link>
            <DottedSeparator className="my-4" />
            <WorkspaceSwitcher />
            <DottedSeparator className="my-4" />
            <Navigation />
            <DottedSeparator className="my-4" />
            <Projects />
        </aside>
    );
};
