{
    let view = new View({
        el: '.menu_songList',
        data: {
            selectedId: ''
        },
        template: `
            <h3>歌曲列表</h3>
            <ol class="songsWrapper">
        `,
        render(data){
            this.o_el.innerHTML = this.template
            let ul = this.o_el.querySelector('ol[class=songsWrapper]')
            data.songs.map((item, index)=>{
                let li = document.createElement('li')
                li.innerHTML = `
                    <div class="songNumber">${index+1}</div>
                    <a class="songLink" href="#">
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
                li.setAttribute('data-songId', item.id)
                li.setAttribute('data-ele', 'song')
                ul.appendChild(li)
            })
        }
    })
    let model = new Model({
        data: {
            songs: []
        }
    })
    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'song', type: 'click', fn: 'clickSong'}
        ],
        init(){
            this.view.init()
            this.getUrlSearch('menuId').then((menuId)=>{
                this.model.fetchSongFromMenu('Song', 'Playlist', menuId, 'songs').then(()=>{
                    this.view.render(this.model.data)
                })
            })
            this.bindEvents()
        },
        clickSong(target){
            this.view.data.selectedId = target.getAttribute('data-songId')
            window.location.href = `/src/song.html/?songId=${this.view.data.selectedId}`
        }
        
    })

    controller.init()
}