{
    let view = new View({
        el: 'section.fshSongs',
        template: `
            <h2 class="sectionTitle">最新音乐</h2>
            <ol class="songsWrapper"></ol>
        `,
        render(data){
            this.o_el.innerHTML = this.template
            let ul = this.o_el.querySelector('ol[class=songsWrapper]')
            data.songs.slice(0,10).map((item)=>{
                let li = document.createElement('li')
                li.innerHTML = `
                    <a href="" class="songLink">
                        <h3 class="songName">${item.songName}</h3>
                        <p class="singer">
                            <svg class="icon songSq" aria-hidden="true">
                                <use xlink:href="#icon-sq"></use>
                            </svg>
                            ${item.singer}
                        </p>
                        <svg class="icon songPlay" aria-hidden="true">
                            <use xlink:href="#icon-bofang"></use>
                        </svg>
                    </a>
                `,
                li.setAttribute('data-id', item.id)
                ul.appendChild(li)
            })
        }
    })

    let model = new Model({
        resourceName: 'Song',
        data: {
            songs: []
        },
        fetchAll(){
            songStorage = new AV.Query('Song')
            return songStorage.find().then((responseData)=>{
                this.data.songs = responseData.map((item)=>{
                    return {
                        id: item.id,
                        songName: item.attributes.songName,
                        singer: item.attributes.singer
                    }
                })
            })
        }

    })

    let controller = new Controller({
        view: view,
        model: model,
        init(){
            this.view.init()
            this.model.fetchAll().then(()=>{
                this.view.render(this.model.data)
            })
        }
    })
    controller.init()
}