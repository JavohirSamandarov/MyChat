import { ChatInput, Sidebar, Topbar } from '@/widgets'
import './MainLayout.css'

const MainLayout = () => {
    return (
        <div className='main-layout'>
            <Sidebar />
            <div className='main-content'>
                <Topbar />
                <div className='content-area'>
                    <ChatInput />
                </div>
            </div>
        </div>
    )
}

export default MainLayout
