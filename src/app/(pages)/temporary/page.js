'use client'

import Image from 'next/image'

export default function Home() {
    return(
        <secion className="flex flex-col justify-center items-center h-screen w-full gap-[56px]">
            <h1 className="header text-4xl">
                How are you feeling today?
            </h1>
            <div className="presets flex gap-[70px]">
                <button className="bg-[url(/bc/happy.png)] w-[155px] h-[155px] rounded-2xl bg-cover flex justify-start items-end p-3 text-2xl">Happy</button>
                <button className="bg-[url(/bc/calm.png)] w-[155px] h-[155px] rounded-2xl bg-cover flex justify-start items-end p-3 text-2xl">Calm</button>
                <button className="bg-[url(/bc/gloomy.png)] w-[155px] h-[155px] rounded-2xl bg-cover flex justify-start items-end p-3 text-2xl">Gloomy</button>
                <button className="bg-[url(/bc/excited.png)] w-[155px] h-[155px] rounded-2xl bg-cover flex justify-start items-end p-3 text-2xl">Excited</button>
                <button className="bg-[url(/bc/anger.png)] w-[155px] h-[155px] rounded-2xl bg-cover flex justify-start items-end p-3 text-2xl">Anger</button>
                <button className="bg-[url(/bc/confused.png)] w-[155px] h-[155px] rounded-2xl bg-cover flex justify-start items-end p-3 text-2xl">Confuse</button>
            </div>
            <button className="mt-8 border rounded-full border-white px-5 py-2 flex gap-[10px]">
                <p>...or just jot down whatever’s on your mind</p>
                <Image src="/return.svg" alt="return btn" width={20} height={20} />
            </button>
        </secion>
    )
}