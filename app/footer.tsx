import {Github} from "lucide-react"

export default function Footer({className}: {className?: string}) {
    return (
        <footer className={`${className = ''} text-white w-full h-fit items-center flex justify-between px-8`}>
            <div className='flex flex-col'>
            <span className='text-[#c3abff]'>Developed by <a href='https://x.com/l1nway'>l1nway</a></span>
            </div>
            <a href='https://github.com/l1nway'>
            <Github className='text-[#a684ff] hover:scale-[1.05] hover:text-[#ffeafe] transition-[colors, transform] duration-300 cursor-pointer'/>
            </a>
        </footer>
    )
}