import {Button} from '@/components/ui/button'
import {DeleteProps} from './dashboardTypes'
import ShowClarify from '../components/showClarify'
import SlideDown from '../components/slideDown'
import {X} from 'lucide-react'

export default function Delete({action, onClose, deleteGroup}: DeleteProps) {

    return (
        <ShowClarify visibility={action} onClose={onClose}>
            <div className='text-white flex justify-between border-b border-[#1e2939] pb-4'>
                <div className='flex flex-col'>
                    <h1>
                        Are you sure you want to {action ? action : 'action'} this group?
                    </h1>
                    <SlideDown className='text-[#959dab]' visibility={action == 'delete'}>
                        This action cannot be undone.
                    </SlideDown>
                </div>
            <X onClick={onClose} className='text-[#99a1af] hover:text-white cursor-pointer transition-colors duration-300'/>
            </div>
            <div className='flex gap-2 w-full justify-between pt-4'>
                <Button className={`w-[48%] bg-[#1e2939] hover:bg-[#303844] cursor-pointer`} onClick={onClose}>
                    Cancel
                </Button>
                <Button className={`capitalize w-[48%] bg-red-500 hover:bg-red-700 transition-colors duration-300 cursor-pointer`} onClick={deleteGroup}>
                    {action ? action : 'action'}
                </Button>
            </div>
        </ShowClarify>
    )
}