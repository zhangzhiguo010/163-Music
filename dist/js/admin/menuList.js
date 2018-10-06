{
    let view = new View2({
        el: '.menuList-inner',
        data: {
            selectedId: '', // 被点击的歌单的id值
        },
        template:`
            <div class="amount-wrapper">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-suoyou"></use>
                </svg>
                <span>所有歌曲(共 {songMenuAmount个} </span>
            </div>
            <div class="create-wrapper clearfix">
                <div class="createButton" data-ele="createButton">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-tianjia"></use>
                    </svg>
                    <span>添加歌单</span>
                </div>
            </div>
            <ul class="item-wrapper">
                <li>
                    <div></div>
                    <div>歌单名</div>
                    <div>创建者</div>
                    <div>描述</div>
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
            <div>{menuName}</div>
            <div>{creator}</div>
            <div>{description}</div>
            <div class="congtrolTag">
                <div data-ele="checkSong">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-chakan"></use>
                    </svg>
                    <span>查看</span>
                </div>
                <div data-ele="addSong">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-add"></use>
                    </svg>
                    <span>添加</span>
                </div>
                <div data-ele="editMenu">
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
            </div>    
        `,
        render(data){
            data.menus.map((menu)=>{
                let newTemplate = this.templateLi
                let placeholder = ['coverUrl', 'menuName', 'creator', 'description']
                let li = document.createElement('li')
                let ul = this.o_el.querySelector('ul[class=item-wrapper]')
                placeholder.map((item)=>{
                    newTemplate = newTemplate.replace(`{${item}}`, menu[item] || '')
                })
                li.innerHTML = newTemplate
                li.setAttribute('data-menuId', menu.menuId)
                li.setAttribute('data-ele', 'listItem')
                li.classList.add('autoCreateSongLi')
                ul.appendChild(li)
            })
        }
    })

    let model = new Model2({
        data: {
            menus: [],  // 它装的是歌单
            songsOfMenu: [],    // 它装的是某个歌单中的音乐
            allSongs: []    //它装的是所有歌曲
        },
    })

    let controller = new Controller2({
        view: view,
        model: model,
        events: [
            {ele: 'listItem', type: 'click', fn: 'handleListItem'},
            {ele: 'editMenu', type: 'click', fn: 'handleEditMenu'},
            {ele: 'checkSong', type: 'click', fn: 'handleCheckSong'},
            {ele: 'addSong', type: 'click', fn: 'handleAddSong'}
        ],
        eventHub: [
            {type: 'selectTab', fn: 'listenSelectTab'},
            {type: 'newMenuComplete', fn: 'listenNewMenuComplete'},
            {type: 'editMenuComplete', fn: 'listenEditMenuComplete'},
        ],
        init(){
            this.view.init()
            this.bindEvents()
            this.bindEventHub()  
        },
        listenSelectTab(data){
            // 判断显示还是隐藏
            if(data.tabName === 'tab_menuList'){
                this.model.data.menus = []
                document.querySelector('.menuList').classList.add('active')
                let menuStorage = new AV.Query('Playlist')
                menuStorage.find().then((responseData)=>{
                    responseData.map((item)=>{
                        let menuId = item.id
                        let {menuName, creator, description, coverUrl} = item.attributes
                        this.model.data.menus.push({
                            menuId: menuId,
                            menuName: menuName,
                            creator: creator,
                            description: description,
                            coverUrl: coverUrl
                        })
                    })
                    this.view.init()
                    this.view.render(this.model.data)
                })
            }else{
                document.querySelector('.menuList').classList.remove('active')
            }
        },
        // 处理歌曲的点击，记录下id值
        handleListItem(target){
            this.view.data.selectedId = target.getAttribute('data-menuId')
        },
        // 编辑按钮被点击
        handleEditMenu(){
            window.eventHub.trigger('editMenu', {id: this.view.data.selectedId})
            document.querySelector('.menuList').classList.remove('active')
        },
        listenNewMenuComplete(data){
            document.querySelector('.menuList').classList.add('active')
            // 将数据加入本地存储
            this.model.data.menus.push(data)
            // 渲染页面
            this.view.init()
            this.view.render(this.model.data)
        },
        // 歌单更新完成，修改model中相应数据，渲染页面
        listenEditMenuComplete(data){
            document.querySelector('.menuList').classList.add('active')
            this.model.data.menus.map((item)=>{
                if(item.menuId === data.menuId){
                    Object.assign(item, data)
                    this.view.init()
                    this.view.render(this.model.data)
                }
            })
        },

        handleCheckSong(){
            // 通过点击的歌单的id值，找到所有歌曲
            // 发布查看事件
            let menuItem = AV.Object.createWithoutData('Playlist', this.view.data.selectedId)
            songStorage = new AV.Query('Song')
            songStorage.equalTo('dependent', menuItem)
            songStorage.find().then((responseData)=>{
                window.eventHub.trigger('menuCheckSong', {data: responseData, menuId: this.view.data.selectedId})
                document.querySelector('.menuList').classList.remove('active') 
            })
        },
        handleAddSong(){
            window.eventHub.trigger('select')
            // 找到所有歌曲
            let songStorage = new AV.Query('Song')
            songStorage.find().then((all)=>{
                // 找到歌单中歌曲
                let menuStorageItem = AV.Object.createWithoutData('Playlist', this.view.data.selectedId)
                songStorage.equalTo('dependent', menuStorageItem)
                songStorage.find().then((some)=>{
                    // 作对比
                    let currentData = []
                    all.map((item1, index)=>{
                        some.map((item2)=>{
                            if(item1.id === item2.id){
                                all[index] = ''
                            }
                        })
                    })
                    all.map((item)=>{
                        if(item !== ''){
                            currentData.push(item)
                        }
                    })
                    // 将歌单中没有的歌曲发出去
                    window.eventHub.trigger('menuAddSong', {data: currentData, menuId: this.view.data.selectedId})
                    document.querySelector('.menuList').classList.remove('active') 
                })
            })
        }
    })

    controller.init()
}