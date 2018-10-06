{
    let view = new View({
        el: 'main > #page_sch',
        data: {
            song: {}
        },
        template: `
            <form class="sch_form">
                <div class="sch_cover">
                    <input type="text" class="sch_input" data-ele="txt" autofocus>
                    <label>搜索歌曲、歌手、专辑</label>
                    <svg class="icon schIcon" aria-hidden="true">
                        <use xlink:href="#icon-sousuo"></use>
                    </svg>
                    <figure class="sch_close" data-ele="close">
                        <svg class="icon closeIcon" aria-hidden="true">
                            <use xlink:href="#icon-shanchu"></use>
                        </svg>
                    </figure>
                </div>
            </form>
            <section class="sch_view">
                <h3></h3>
                <ul class="sch_result"></ul>
            </section>
            <section class="click_view">
                <ol class="songsWrapper"></ol>
            </section>
        `,
        render_createSearch(data){
            let ul = this.o_el.querySelector('.sch_view .sch_result')
            data.songs.map((item)=>{
                let li = document.createElement('li')
                li.innerHTML = `
                    <span>${item.songName}</span>
                    <svg class="icon schIcon" aria-hidden="true">
                        <use xlink:href="#icon-sousuo"></use>
                    </svg>
                `
                li.setAttribute('data-songId', item.songId)
                li.setAttribute('data-ele', 'songLi')
                li.classList.add('sch_li')
                ul.appendChild(li)
            })
        },
        render_songClickSong(data){
            let ol = this.o_el.querySelector('.click_view .songsWrapper')
            let li = document.createElement('li')
            li.innerHTML = `
                <div class="songLink">
                    <h3 class="songName">${data.songName}</h3>
                    <p class="singer">
                        <svg class="icon songSq" aria-hidden="true">
                            <use xlink:href="#icon-sq"></use>
                        </svg>
                        ${data.singer}
                    </p>
                    <svg class="icon songPlay" aria-hidden="true">
                        <use xlink:href="#icon-bofang"></use>
                    </svg>
                </div>
            `,
            li.setAttribute('data-songId', data.songId)
            li.setAttribute('data-ele', 'song')
            ol.appendChild(li)
        },
        showOrHidden(key, data){
            let label = this.o_el.querySelector('label').classList
            let close = this.o_el.querySelector('.sch_close').classList
            let sch_view = this.o_el.querySelector('.sch_view').classList
            let click_view = this.o_el.querySelector('.click_view').classList
            let hint = this.o_el.querySelector('.sch_view h3')
            let input = this.o_el.querySelector('.sch_input')

            if(key === 'init'){
                label.add('active')
                close.remove('active')
                sch_view.remove('active')
                click_view.remove('active')
            }else if(key === 'input_null'){
                label.remove('active')
                close.add('active')
                sch_view.remove('active')
                click_view.remove('active')
            }else if(key === 'input_content'){
                label.remove('active')
                close.add('active')
                sch_view.add('active')
                click_view.remove('active')
                hint.innerText = `搜索“${data}”`
            }else if(key === 'close'){
                label.add('active')
                close.remove('active')
                sch_view.remove('active')
                click_view.remove('active')
                input.value = ''
            }else if(key === 'clickSong'){
                label.remove('active')
                close.add('active')
                sch_view.remove('active')
                click_view.add('active')
                input.value = data
            }
        }
    })

    let model = new Model({
        data: {
            songs: []
        },
    })

    let controller = new Controller({
        view: view,
        model: model,
        timer: '',
        events: [
            {ele: 'txt', type: 'input', fn: 'inputTxt'},
            {ele: 'close', type: 'click', fn: 'listenClose'},
            {ele: 'songLi', type: 'click', fn: 'clickSongLi'},
            {ele: 'song', type: 'click', fn: 'clickSong'}
        ],
        eventHub: [
            {type: 'clickTab', fn: 'listenClickTab'}
        ],
        init(){
            this.view.init()
            this.bindEventHub()
            this.bindEvents()
        },
        listenClickTab(data){
            this.view.toggleShowOrHidden('page_sch', data.tabName, '#page_sch')
            this.view.showOrHidden('init')
        },
        inputTxt(target){
            if(target.value.trim() === ''){
                this.view.showOrHidden('input_null')
                return 
            }else{
                this.view.showOrHidden('input_content', target.value)
                this.view.clearUlOrOl('.sch_result')
                if(this.timer){window.clearTimeout(this.timer)}
                this.timer = setTimeout(()=>{
                    this.timer = null
                    this.model.relationFetch('songs', 'Song', target.value, 'songName', 'singer', ).then(()=>{
                        this.view.render_createSearch(this.model.data)
                    })
                }, 300)
            }
        },
        listenClose(){
            this.view.showOrHidden('close')
        },
        clickSongLi(target){
            let songId = target.getAttribute('data-songId')
            this.model.data.songs.map((item)=>{
                if(item.songId = songId){
                    Object.assign(this.view.data.song, item)
                }
            })
            this.view.showOrHidden('clickSong', this.view.data.song.songName)
            this.view.render_songClickSong(this.view.data.song)
        },
        clickSong(target){
            let songId = target.getAttribute('data-songId')  
            window.location.href = `/src/song.html/?songId=${songId}`
        }
    })

    controller.init()
}