{
    let view = new View({
        el: 'section.fshSongs',
        template: `
            <h2 class="sectionTitle">最新音乐</h2>
            <ol class="songsWrapper"></ol>
        `,
        templateLi: `
            <a href="" class="songLink">
                <h3 class="songName">{songName}</h3>
                <p class="singer">
                    <svg class="icon songSq" aria-hidden="true">
                        <use xlink:href="#icon-sq"></use>
                    </svg>
                    {singer}
                </p>
                <svg class="icon songPlay" aria-hidden="true">
                    <use xlink:href="#icon-bofang"></use>
                </svg>
            </a>
        `,
        render(data){
            let ul = this.o_el.querySelector('.songsWrapper')
            this.createLi(data).then((allLi)=>{
                allLi.map((li)=>{
                    ul.appendChild(li)
                })
            })
        },
        createLi(data){
            return new Promise((resolve)=>{
                let placeholder = ['songName', 'singer']
                // 展示前十首歌曲
                let allLi = data.songs.slice(0,10).map((song)=>{
                    let newTemplate = this.templateLi
                    placeholder.map((item)=>{
                        newTemplate = newTemplate.replace(`{${item}}`, song[item])
                    })
                    let li = document.createElement('li')
                    li.innerHTML = newTemplate
                    li.setAttribute('data-id', song.id)
                    return li
                })
                resolve(allLi)
            })
        }
    })

    let model = new Model({
        resourceName: 'Song',
        data: {
            songs: []
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        init(){
            this.view.init()
            this.bindProxy()
            this.batchFetchFromLeanCloud_proxy()
        }
    })
    controller.init()
}