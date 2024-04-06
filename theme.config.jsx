import Image from 'next/image';

const style = {
    imageStyle: {
        display: 'inline-block',
        marginRight: '0.3rem',
    }
}

export default {
    logo: <span><Image style={style.imageStyle} src="./assets/blogIcon.svg" width="20" height="20" alt=""/> Squirrel's Tech</span>,
    project: {
        link: "https://github.com/mkrtchian/reading-notes",
    },
    docsRepositoryBase: "https://github.com/mkrtchian/reading-notes/blob/main",
    head: ()=> {
        return (
            <>
                <link rel="icon" href="./assets/blogIcon.svg" type="image/svg" />
                <link rel="shortcut icon" href="./assets/blogIcon.svg" />
            </>
        )
    },
    feedback: {
        content: "對於文章內容有問題嗎?點擊這裡發問吧!"
    }
    // ... other theme options
}