{
    let view = {
        el: '.songList',
        template:`
            <h3>歌曲列表</h3>
            <ul class="song-list"></ul>
        `,
        render(data){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
            data.map((item)=>{
                let li = document.createElement('li')
                li.setAttribute('data-song-id', item.id)
                li.innerText = item.name
                this.o_el.querySelector('ul').appendChild(li)
            })
        },
        activeToggle(key, id){
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
            // [{id:'', name:'', singer:'', url:'', cover:'', lyrics:''}, {...........}]
            songs: [],
            selectId: ''
        },
        fetch(){
            let query = new AV.Query('Song');
            return query.find().then((allSong)=>{
                allSong.map((song)=>{
                    this.data.songs.push(Object.assign({}, {id:song.id}, song.attributes))
                })
            })
        },
        save(){}
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data.songs)
            this.model.fetch().then(()=>{
                this.view.render(this.model.data.songs)
            })
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents(){
            this.view.o_el.addEventListener('click', (ev)=>{
                if(ev.target.nodeName.toLowerCase() === 'li'){
                    this.judgeActive(ev) 
                }
            })
        },
        judgeActive(ev){
            if(this.model.data.selectId){
                if(this.model.data.selectId !== ev.target.getAttribute('data-song-id')){
                    this.view.activeToggle('deactive', this.model.data.selectId)
                }
            }
            this.view.activeToggle('active', ev.target.getAttribute('data-song-id'))
            this.model.data.selectId = ev.target.getAttribute('data-song-id')
            eventHub.trigger('select', this.model.data.selectId)
        },
        bindEventHub(){
            eventHub.listen('uploadBefore', ()=>{
                if(this.model.data.selectId){
                    this.view.activeToggle('deactive', this.model.data.selectId)
                }
            })
            eventHub.listen('create', (data)=>{
                this.model.data.songs.push(data)
                this.view.render(this.model.data.songs)
            })
            eventHub.listen('change', (data)=>{
                this.model.data.songs.map((song)=>{
                    if(song.id === data.id){
                        Object.assign(song, data)
                        this.view.render(this.model.data.songs)
                    }
                })
            })  
        }
    }

    controller.init(view, model)
}