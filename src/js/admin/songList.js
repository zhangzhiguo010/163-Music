{
    let view = new View({
        el: '.songList-inner',
        template:`
            <div class="songsAmount-wrapper">
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
            <ul class="songsItem-wrapper">
                <li>
                    <div></div>
                    <div>歌名</div>
                    <div>创建时间</div>
                    <div>更新时间</div>
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
            <div>{createdAt}</div>
            <div>{updatedAt}</div>
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
            let allLi = []
            this.createLi(data, allLi)
            allLi.map((li)=>{
                this.o_el.querySelector('ul').appendChild(li)
            })
        },
        createLi(data, allLi){
            let placeholder = ['coverUrl', 'songName', 'createdAt', 'updatedAt']
            data.songs.map((song)=>{
                let newTemplateLi = this.templateLi
                let li = document.createElement('li')
                placeholder.map((key)=>{
                    newTemplateLi = newTemplateLi.replace(`{${key}}`, song[key])
                })
                li.innerHTML = newTemplateLi
                li.setAttribute('data-song-id', song.id)
                li.setAttribute('data-ele', 'li')
                li.classList.add('autoCreateSongLi')
                allLi.push(li)
            })
            return allLi
        },
        toggleShowOrHidden(data){
            if(data === 'show'){
                console.log('显示')
                this.o_el.parentElement.classList.add('active')
            }else if(data === 'hidden'){
                this.o_el.parentElement.classList.remove('active')
            }
        },
        toggleActivateLi(key, id){
            let selectLi = this.o_el.querySelector(`li[data-song-id='${id}'`)
            if(key === 'active'){
                selectLi.classList.add('active')
            }else if(key === 'deactive'){
                selectLi.classList.remove('active')
            }
        }
    })



    let model = new Model({
        data: {
// [{id:'', songName:'', songUrl:'', coverName:'', coverUrl:'', lyrics:'', createdAt:'', updatedAt:''}, {......}]
            songs:[],
            selectId: '' 
        },
        resourceName: 'Song',
        afterFetch(responseData){
            responseData.map((song)=>{
                let newCreatedAt = this.handleDate(song.createdAt)
                let newUpdatedAt = this.handleDate(song.updatedAt)
                this.data.songs.push(Object.assign({}, 
                    {id:song.id, createdAt:newCreatedAt, updatedAt:newUpdatedAt}, 
                    song.attributes
                ))
            })
        },
        handleDate(date){
            let year = date.getFullYear()
            let month = date.getMonth()+1
            let day = date.getDate()
            return `${year}.${month}.${day}`
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'li', type: 'click', fn: 'activateLi'},
            {ele: 'createButton', type: 'click', fn: 'createSong'},
            {ele: 'editSong', type: 'click', fn: 'editSong'}
        ],
        eventHub: [
            {type: 'selectTab', fn: 'afterSelectTab'},
            {type: 'newSongComplete', fn: 'afterNewSongComplete'},
            {type: 'updateSongComplete', fn: 'afterUpdateSongComplete'}
        ],
        // 实例的init覆盖掉它的类的init，此处需要batchFetchFromLeanCloud，其他模块不需要
        init(){
            this.view.render(this.model.data)
            // 掉进陷阱：自动更新页面
            this.batchFetchFromLeanCloud_proxy()
        },
        activateLi(target){
            this.view.toggleActivateLi('active', target.getAttribute('data-song-id'))
            this.model.data.selectId = target.getAttribute('data-song-id') 
        },
        createSong(){
            window.eventHub.trigger('selectTab', {tabName: 'tab_newAndEdit'})
        },
        editSong(target){
            while(target.parentElement !== 'ul'){
                if(target.nodeName.toLowerCase() === 'li'){
                    window.eventHub.trigger('selecteSong', {id: target.getAttribute('data-song-id')})
                    break
                }
                target = target.parentElement
            }
            window.eventHub.trigger('selectTab', {tabName: 'tab_newAndEdit'})
        },
        afterSelectTab(data){
            if(data.tabName === 'tab_songList'){
                this.view.toggleShowOrHidden('show')
                this.view.render(this.model.data)
            }else{
                this.view.toggleShowOrHidden('hidden')
            }
        },
        afterNewSongComplete(data){
            this.model.data.songs.push(data)
            this.view.render(this.model.data)
        },
        afterUpdateSongComplete(data){
            this.model.data.songs.map((song)=>{
                if(song.id === data.id){
                    Object.assign(song, data)
                    this.view.render(this.model.data)
                }
            })
        }
    })
    
    controller.init()
}


