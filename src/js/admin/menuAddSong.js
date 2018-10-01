{
    let view = new View2({
        data: {
            selectedId: ''
        },
        el: '.menuAddSong-inner',
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
                <div data-ele="addSong">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-add"></use>
                    </svg>
                    <span>加入歌单</span>
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
            let placeholder = ['coverUrl', 'songName', 'singer', 'menuName']
            data.songs.map((song)=>{
                let ul = this.o_el.querySelector('ul[class=item-wrapper]')
                let li = document.createElement('li')
                let newTemplate = this.templateLi
                placeholder.map((item)=>{
                    newTemplate = newTemplate.replace(`{${item}}`, song[item] || '')
                })
                li.innerHTML = newTemplate
                li.setAttribute('data-id', song.songId)
                li.setAttribute('data-ele', 'liItem')
                li.classList.add('autoCreateSongLi')
                ul.appendChild(li)
            })
        }
    })

    let model = new Model2({
        data: {
            menuId: '',    // 被点击添加歌曲按钮的那个歌单的id值
            // [{id:'', coverUrl:'', songName:'', singer:'', menuName:''}, {...}]
            songs: []
        }
    })

    let controller = new Controller2({
        view: view,
        model: model,
        events: [
            {ele: 'liItem', type: 'click', fn: 'handleLiItem'},
            {ele: 'addSong', type: 'click', fn: 'handleAddSong'}
        ],
        eventHub: [
            {type: 'menuAddSong', fn: 'listenMenuAddSong'},
            {type: 'selectTab', fn: 'listenSelectTab'}
        ],
        init(){
            this.view.init()
            this.bindEvents()
            this.bindEventHub()  
        },
        listenSelectTab(){
            document.querySelector('.menuAddSong').classList.remove('active')
        },
        listenMenuAddSong(obj){
            document.querySelector('.menuAddSong').classList.add('active')
            this.model.data.songs = []
            this.model.data.menuId = obj.menuId
            // 通过参数获得所有歌曲，这些歌曲都是歌单中不存在的
            if(obj !== ''){
                obj.data.map((item)=>{
                    // 得到每首歌曲的歌单
                    let menuName   
                    let songItem = AV.Object.createWithoutData('Song', item.id);
                    songItem.fetch({ include: ['dependent'] }).then((data)=>{
                        menuName = data.get('dependent').attributes.menuName
                        let songId = item.id
                        let {songName, songUrl, coverUrl, singer, compose, lyrics} =  item.attributes
                        // 歌曲和歌单信息存储本地
                        this.model.data.songs.push({
                            songId: songId, 
                            songName: songName, 
                            songUrl: songUrl, 
                            coverUrl: coverUrl, 
                            singer: singer, 
                            compose: compose, 
                            lyrics: lyrics,
                            menuName: menuName, //歌曲所属歌单
                        })
                        // 渲染页面
                        this.view.init()
                        this.view.render(this.model.data)
                    })
                })
            }else{
                // 渲染页面
                this.view.init()
            }
        },
        // 记录点击的那首歌曲的id值
        handleLiItem(target){
            this.view.data.selectedId = target.getAttribute('data-id')
        },
        // 将歌曲关联上歌单
        handleAddSong(){
            let songItem = AV.Object.createWithoutData('Song', this.view.data.selectedId)
            let menuItem = AV.Object.createWithoutData('Playlist', this.model.data.menuId)
            songItem.set('dependent', menuItem)
            songItem.save()
        }
    })

    controller.init()
}
