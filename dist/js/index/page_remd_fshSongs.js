{
    let view = new View({
        el: 'section.fshSongs',
        data: {
            selectedId: ''
        },
        template: `
            <h2 class="sectionTitle">最新音乐</h2>
            <figure class="loading"><img src="./img/index/index_load.gif" alt="下载动画"></figure>
            <ol class="songsWrapper"></ol>
        `,
        render(data){
            this.o_el.innerHTML = this.template
            let ul = this.o_el.querySelector('ol[class=songsWrapper]')
            let loading = this.o_el.querySelector('figure')
            data.songs.slice(0,10).map((item)=>{
                let li = document.createElement('li')
                li.innerHTML = `
                    <div class="songLink">
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
                    </div>
                `,
                li.setAttribute('data-id', item.id)
                li.setAttribute('data-ele', 'songClick')
                ul.appendChild(li)
            })
            loading.classList.add('active')
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
        events: [
            {ele: 'songClick', type: 'click', fn: 'handleSongClick'}
        ],
        init(){
            this.view.init()
            this.model.fetchAll('Song', 'songs').then(()=>{
                this.view.render(this.model.data)
            })
            this.bindEvents()
        },
        handleSongClick(target){
            this.view.data.selectedId = target.getAttribute('data-id')
            window.location.href = `/dist/song.html?songId=${this.view.data.selectedId}`
        }
    })
    controller.init()
}