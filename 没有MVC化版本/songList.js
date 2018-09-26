{
    let view = {
        el: '.songList-inner',
        template:`
            <div class="songsAmount-wrapper">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-suoyou"></use>
                </svg>
                <span>所有歌曲(共 {songsAmount曲} </span>
            </div>
            <div class="create-wrapper clearfix">
                <div class="createButton">
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
            <div class="congtrolTag" name="editSong">
                <div name="editSong">
                    <svg class="icon" aria-hidden="true" name="editSong">
                        <use xlink:href="#icon-bianji"></use>
                    </svg>
                    <span name="editSong">编辑</span>
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
        init(){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
        },
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
                li.classList.add('autoCreateSongLi')
                allLi.push(li)
            })
            return allLi
        },
        toggleShowOrHidden(data){
            if(data === 'show'){
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
    }
    let model = {
        data: {
// [{id:'', songName:'', songUrl:'', coverName:'', coverUrl:'', lyrics:'', createdAt:'', updatedAt:''}, {......}]
            songs:[],
            selectId: '' 
        },
        fetch(){
            let query = new AV.Query('Song')
            return query.find().then((songs)=>{
                songs.map((song)=>{
                    this.addDataToModel(song)
                })
            })
        },
        addDataToModel(song){
            let newCreatedAt = this.handleDate(song.createdAt)
            let newUpdatedAt = this.handleDate(song.updatedAt)
            this.data.songs.push(Object.assign({}, 
                {id:song.id, createdAt:newCreatedAt, updatedAt:newUpdatedAt}, 
                song.attributes
            ))
        },
        handleDate(date){
            let year = date.getFullYear()
            let month = date.getMonth()+1
            let day = date.getDate()
            return `${year}.${month}.${day}`
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.view.render(this.model.data)
            this.model.fetch().then(()=>{
                this.view.render(this.model.data)
            })
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents(){
            // 找到被点击的li元素，点击位置包括他的后代元素
            // 激活该元素，其他元素取消激活
            this.view.o_el.addEventListener('click', (ev)=>{
                let target = ev.target
                this.judgeLi(target).then((li)=>{
                    this.selectLi(li)
                })
            })

            this.view.o_el.querySelector('.createButton').addEventListener('click', ()=>{
                window.eventHub.trigger('selectTab', {tabName: 'tab_newAndEdit'})
            })

            this.view.o_el.addEventListener('click', (ev)=>{
                if(ev.target.getAttribute('name') === 'editSong'){
                    let target = ev.target
                    this.judgeLi(target).then((li)=>{
                        window.eventHub.trigger('selecteSong', {id: li.getAttribute('data-song-id')})
                        window.eventHub.trigger('selectTab', {tabName: 'tab_newAndEdit'})
                    })
                }
                
            })
        },
        bindEventHub(){
            // 监听目录模块，哪个标签被选中
            window.eventHub.listen('selectTab', (data)=>{
                if(data.tabName === 'tab_songList'){
                    this.view.toggleShowOrHidden('show')
                }else{
                    this.view.toggleShowOrHidden('hidden')
                }
            })

            window.eventHub.listen('updateComplete', (data)=>{
                this.model.data.songs.map((song)=>{
                    if(song.id === data.song.id){
                        Object.assign(song, data.song)
                        this.view.render(this.model.data)
                    }
                })
            })

            window.eventHub.listen('newSongComplete', (data)=>{
                this.model.data.songs.push(data)
                this.view.render(this.model.data)
            })
        },  
        judgeLi(target){
            return new Promise((resolve)=>{
                while(target !== this.view.o_el){
                    if(target.nodeName.toLowerCase() === 'li'){
                        resolve(target)
                        break
                    }
                    target = target.parentElement
                }
            })
        },
        selectLi(target){
            if(this.model.data.selectId){
                if(this.model.data.selectId !== target.getAttribute('data-song-id')){
                    this.view.toggleActivateLi('deactive', this.model.data.selectId)
                }
            }
            this.view.toggleActivateLi('active', target.getAttribute('data-song-id'))
            this.model.data.selectId = target.getAttribute('data-song-id')
        }
    }

    controller.init(view, model)
}