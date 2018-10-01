{
    let view = new View2({
        el: '.menu_songList',
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
                li.setAttribute('data-songId', item.songId)
                ul.appendChild(li)
            })
        }
    })
    let model = new Model2({
        data: {
            songs: []
        }
    })
    let controller = new Controller2({
        view: view,
        model: model,
        eventHub: [
            {type: 'uploadMenu', fn: 'listenUploadMenu'}
        ],
        init(){
            this.view.init()
            this.bindEventHub()
        },
        listenUploadMenu(obj){
            let menuItem = AV.Object.createWithoutData('Playlist', obj.menuData.menuId)
            let songStorage = new AV.Query('Song')
            songStorage.equalTo('dependent', menuItem)
            return songStorage.find().then((responseData)=>{
                this.model.data.songs = responseData.map((item)=>{
                    return {
                        songId: item.id,
                        songName: item.attributes.songName,
                        singer: item.attributes.singer,
                    }
                })
                this.view.render(this.model.data)
            })
        }
    })

    controller.init()
}