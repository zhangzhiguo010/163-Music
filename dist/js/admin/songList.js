{
    let view = new View2({
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
            <div class="selectButton-wrapper">
                <span>ic</span>
                <span>全选</span>
            </div>
            <div class="deleteButton-wrpper">
                <span>删除</span>
            </div>
            <div class="page-wrapper">
                <div class="clearfix">
                    <div class="nextPageButton">
                        <span>下一页</span>
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-fenyexiayiye"></use>
                        </svg>
                    </div>
                    <div class="previousPageButton">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-fenyeshangyiye"></use>
                        </svg>
                        <span>上一页</span>
                    </div>
                </div>
            </div>
        `,
        templateLi: `
            <div class="coverImgWrapper">
                <img src="{coverUrl}" alt="封面">
            </div>
            <div>{songName}</div>
            <div>{singer}</div>
            <div>{menuName}</div>
            <div class="congtrolTag">
                <div data-ele="editSong">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-bianji"></use>
                    </svg>
                    <span>编辑</span>
                </div>
                <div>
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
        `,
        render(data){
            let ul = this.o_el.querySelector('ul[class=item-wrapper]')
            let placeholder = ['coverUrl', 'songName', 'singer', 'menuName']
            data.songs.map((song)=>{
                let li = document.createElement('li')
                let newTemplate = this.templateLi
                placeholder.map((item)=>{
                    newTemplate = newTemplate.replace(`{${item}}`, song[item] || '')
                })
                li.innerHTML = newTemplate
                li.setAttribute('data-id', song.id)
                li.setAttribute('data-ele', 'listItem')
                li.classList.add('autoCreateSongLi')
                ul.appendChild(li)
            })
        }
    })

    let model = new Model2({
        data: {
            // [{id:'', coverUrl:'', songName:'', singer:'', menuName:''}, {...}]
            songs: []
        }
    })

    let controller = new Controller2({
        view: view,
        model: model,
        events: [
            {ele: 'listItem', type: 'click', fn: 'handleListItem'},
            {ele: 'editSong', type: 'click', fn: 'handleEditSong'},
        ],
        eventHub: [
            {type: 'selectTab', fn: 'listenSelectTab'},
            {type: 'editSongComplete', fn: 'listenEditSongComplete'},
            {type: 'newSongComplete', fn: 'listenNewSongComplete'},
        ],
        init(){
            this.view.init()
            this.bindProxy()
            this.bindEvents()
            this.bindEventHub()  
        },
        listenSelectTab(obj){
            // console.log(0)
            this.view.toggleShowOrHidden(obj.tabName, 'tab_songList', '.songList')
            this.model.data.songs = []
            // 找到所有歌曲
            let songStorage = new AV.Query('Song')
            // console.log(1)
            songStorage.find().then((responseData)=>{
                // console.log(2)
                responseData.map((item)=>{ 
                    // console.log(3)
                    this.xx(item).then(()=>{
                        // console.log(6)
                        this.view.init()
                        this.view.render(this.model.data)
                    })
                })
            })
        },
        // 找到歌曲对应的歌单名
        xx(item){
            // console.log(4)
            let menuName
            let songItem = AV.Object.createWithoutData('Song', item.id)
            return songItem.fetch({ include: ['dependent'] }).then((data)=>{
                // console.log(5)
                menuName = data.get('dependent').attributes.songMenuName
                this.model.data.songs.push(Object.assign({}, item.attributes, {id: item.id, menuName: menuName}))
            })
        },
        // 监听编辑完歌曲，更新data中对应的歌曲信息，更新页面
        listenEditSongComplete(data){
            document.querySelector('.songList').classList.add('active')
            this.model.data.songs.map((song)=>{
                if(song.id === data.id){
                    Object.assign(song, data)
                    this.view.render(this.model.data)
                }
            })
        },
        listenNewSongComplete(data){
            document.querySelector('.songList').classList.add('active')
            let menuStorage = new AV.Query('Playlist')
            menuStorage.get(data.dependent.id).then((responseData)=>{
                let menuName = responseData.attributes.songMenuName
                this.model.data.songs.push({coverUrl: data.coverUrl, songName: data.songName, singer: data.singer, menuName: menuName})
                this.view.render(this.model.data)
            })
        },
        // 处理歌曲的点击，记录id值
        handleListItem(target){
            this.view.data.selectedId = target.getAttribute('data-id')
        },
        // 处理触发标签切换，触发编辑歌曲事件
        handleEditSong(){
            window.eventHub.trigger('editSong', {id: this.view.data.selectedId})
            document.querySelector('.songList').classList.remove('active')
        }
    })

    controller.init()
}
