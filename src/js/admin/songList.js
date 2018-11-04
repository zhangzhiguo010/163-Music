{
    let view = new View({
        data: {
            selectedId: ''
        },
        el: '.songList-inner',
        template:`
            <div class="amount-wrapper">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-suoyou"></use>
                </svg>
                <span>所有歌曲(共 {songsAmount曲} </span>
            </div>
            <div class="create-wrapper clearfix">
                <div class="createButton" data-ele="createButton">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-tianjia"></use>
                    </svg>
                    <span>添加歌曲</span>
                </div>
            </div>
            <ul class="item-wrapper">
                <li>
                    <div></div>
                    <div>歌名</div>
                    <div>歌手</div>
                    <div>所属歌单</div>
                    <div>操作</div>
                </li>
            </ul>
            <div class="page-wrapper">
                <div id="page_songList"></div>
            </div>
        `,
        render(data){
            let liArray = data.songs.map((item)=>{
                let li = document.createElement('li')
                li.innerHTML = `
                    <div class="coverImgWrapper">
                        <img src="${item.coverUrl || ''}" alt="封面">
                    </div>
                    <div>${item.songName}</div>
                    <div>${item.singer}</div>
                    <div>${item.menuName}</div>
                    <div class="congtrolTag">
                        <div data-ele="songEdit">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-bianji"></use>
                            </svg>
                            <span>编辑</span>
                        </div>
                        <div data-ele="songRemove">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-dustbin"></use>
                            </svg>
                            <span>删除</span>
                        </div>
                        <div>
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-pinglun"></use>
                            </svg>
                            <span>查看评论</span>
                        </div>
                    </div> 
                `
                li.setAttribute('data-id', item.id)
                li.setAttribute('data-ele', 'song_songList')
                li.classList.add('autoCreateSongLi')
                return li
            })
            pagination.call(this, {
                pageWrapper: '#page_songList',
                dataSource: liArray,
                dataSize: 10,
                callBack(newData, maxPageNumber){
                    let ul = this.o_el.querySelector('.item-wrapper')
                    this.clearUlOrOl(ul, [ul.firstElementChild])
                    newData.map((item)=>{
                        ul.appendChild(item) 
                    })
                }
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
            {ele: 'song_songList', type: 'click', fn: 'clickSong_songList'},
            {ele: 'songEdit', type: 'click', fn: 'clickSongEdit'},
            {ele: 'songRemove', type: 'click', fn: 'clickSongRemove'},
        ],
        eventHub: [
            {type: 'selectTab', fn: 'listenSelectTab'},
            {type: 'afterEditSong', fn: 'afterEditSong'},
            {type: 'afterNewSong', fn: 'afterNewSong'}
        ],
        init(){
            this.view.init()
            this.bindEvents()
            this.bindEventHub()  
        },
        listenSelectTab(obj){
            this.view.toggleShowOrHidden(obj.tabName, 'tab_songList', '.songList')
            this.model.fetchAll('Song', 'songs').then(()=>{
                this.view.render(this.model.data)
            })
        },
        // 监听编辑完歌曲，更新data中对应的歌曲信息，更新页面
        afterEditSong(data){
            this.view.toggleActive('.songList', 'active')
            this.model.data.songs.map((song)=>{
                if(song.id === data.id){
                    Object.assign(song, data)
                    this.view.render(this.model.data)
                }
            })
        },
        afterNewSong(data){
            this.view.toggleActive('.songList', 'active')
            this.model.data.push(data)
            this.view.render(this.model.data)
        },
        // 处理歌曲的点击，记录id值
        clickSong_songList(target){
            this.view.data.selectedId = target.getAttribute('data-id')
        },
        // 处理触发标签切换，触发编辑歌曲事件
        clickSongEdit(){
            this.view.toggleActive('.songList', 'deactive')
            window.eventHub.trigger('clickSongEdit', {id: this.view.data.selectedId})
        },
        clickSongRemove(){
            this.model.delete('Song', this.view.data.selectedId)
            this.model.data.songs.map((item, index)=>{
                if(item.id === this.view.data.selectedId){
                    this.model.data.songs[index] = ''
                }
            })
            this.model.data.songs.map((item)=>{
                if(item !== ''){
                    this.model.data.songs.push(item)
                }
            })
            this.view.render(this.model.data)
        }
    })

    controller.init()
}
