{
    let view = {
        el: '.songList',
        template:`
            <h2>歌曲列表</h2>
            <hr>
            <ul></ul>
        `,
        templateLi: `
            <div class="li_cover"><img src="{coverUrl}" alt="封面"></div>
            <span class="li_songName">{songName}</span>
            <span class="li_play">播放</span>
            <span class="li_discuss">评论</span>
            <span class="li_edit">编辑</span>
            <span class="li_delete">删除</span>
        `,
        render(data){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
            let allLi = []
            this.createLi(data, allLi)
            allLi.map((li)=>{
                this.o_el.querySelector('ul').appendChild(li)
            })
        },
        createLi(data, allLi){
            let placeholder = ['coverUrl', 'songName']
            data.songs.map((song)=>{
                let newTemplateLi = this.templateLi
                let li = document.createElement('li')
                placeholder.map((key)=>{
                    newTemplateLi = newTemplateLi.replace(`{${key}}`, song[key])
                })
                li.innerHTML = newTemplateLi
                li.setAttribute('data-song-id', song.id)
                allLi.push(li)
            })
            return allLi
        },
        toggleShowOrHidden(data){
            if(data === 'show'){
                this.o_el.classList.add('active')
            }else if(data === 'hidden'){
                this.o_el.classList.remove('active')
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
            // 数据格式：[{id:'', songName:'', songUrl:'', coverName:'', coverUrl:'', lyrics:''}, {......}]
            songs:[],
            selectId: '' 
        },
        fetch(){
            let query = new AV.Query('Song')
            return query.find().then((songs)=>{
                songs.map((song)=>{
                    this.data.songs.push(Object.assign({}, {id:song.id}, song.attributes))
                })
            })
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
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

            this.view.o_el.addEventListener('click', (ev)=>{
                if(ev.target.getAttribute('class') === 'li_edit'){
                    window.eventHub.trigger('selecteSong', {id: this.model.data.selectId})
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