{
    let view = new View({
        el: 'main > #page_hot',
        template: `
            <figure class="hotTitle">
                <div class="content">
                    <div class="hotLogo"></div>
                    <p class="updateDate">更新日期：09月27日</p>
                </div>
            </figure>
            <ol class="songsWrapper"></ol>
        `,
        render(data){
            let ul = this.o_el.querySelector('.songsWrapper')
            data.songs.map((item, index)=>{
                if(index<9){
                    index = `0${index+1}`
                }else{
                    index = `${index+1}`
                }
                let li = document.createElement('li')
                li.innerHTML = `
                    <span class="songNumber">${index}</span>
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
                `
                li.setAttribute('data-songId', item.id)
                li.setAttribute('data-ele', 'song')
                if(index<3){ li.setAttribute('class', 'ahead') }
                ul.appendChild(li)
            })
        },
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
        eventHub: [
            {type: 'clickTab', fn: 'listenClickTab'}
        ],
        init(){
            this.view.init()
            this.model.fetchAll('Song', 'songs').then(()=>{
                this.view.render(this.model.data)
            })
            this.bindEvents()
            this.bindEventHub()
        },
        clickSong(target){
            let songId = target.getAttribute('data-songId')  
            window.location.href = `/src/song.html?songId=${songId}`
        },
        listenClickTab(data){
            this.view.toggleShowOrHidden('page_hot', data.tabName, '#page_hot')
        }
    })

    controller.init()
}