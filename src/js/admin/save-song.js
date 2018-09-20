{
    let view = {
        el: '#saveSong',
        template:`
            <div class="saveSong-inner">
                <h3>{createOrChange}</h3>
                <form>
                    <label>
                        <span>歌曲</span>
                        <input type="text" name="name" value="{name}">
                    </label>
                    <label>
                        <span>歌手</span>
                        <input type="text" name="singer" value="{singer}">
                    </label>
                    <label>
                        <span>外链</span>
                        <input type="text" name="url" value="{url}">
                    </label>
                    <label>
                        <span>封面</span>
                        <input type="text" name="cover" value="{cover}">
                    </label>
                    <label class="lyrics-label">
                        <span>歌词</span>
                        <textarea name="lyrics" cols="30" rows="10">{lyrics}</textarea>
                    </label>
                    <input type="submit" name="save" value="点击保存" id="submit">
                </form>
            </div>
        `,
        render(data){
            this.o_el = document.querySelector(this.el)
            let placeholder = ['id', 'name', 'singer', 'url', 'cover', 'lyrics']
            let newTemplate = this.template
            placeholder.map((item)=>{
                if(!data.song[item]){data.song[item] = ''}
                newTemplate = newTemplate.replace(`{${item}}`, data.song[item])
            })
            if(data.status === 'create'){
                newTemplate = newTemplate.replace('{createOrChange}', '歌曲新建')
            }else if(data.status === 'change'){
                newTemplate = newTemplate.replace('{createOrChange}', '歌曲修改')
            }
            document.querySelector(this.el).innerHTML = newTemplate            
        }
    }
    let model = {
        data: {
            // {id:'', name:'', singer:'', url:'', cover:'', lyrics:''}
            song: {},
            status: 'create'
        },
        fetch(id){
            let query = new AV.Query('Song')
            return query.get(id).then((song)=>{
                this.updateModelData(song)
            })
        },
        save(data){
            let Song = AV.Object.extend('Song');
            let song = new Song();
            return song.save(data).then((song)=>{
                this.updateModelData(song)
            })
        },
        update(data){
            let song = AV.Object.createWithoutData('Song', this.data.song.id);
            for(let key in data){
                song.set(`${key}`, `${data[key]}`)
            }
            return song.save().then((song)=>{
                this.updateModelData(song)
            })
        },
        updateModelData(data){
            Object.assign(this.data.song, {id:data.id}, data.attributes)
        }

    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents(){
            this.view.o_el.addEventListener('submit', (ev)=>{
                if(ev.target.nodeName.toLowerCase() === 'form'){
                    ev.preventDefault()
                    this.judgeCreateOrChange()
                }
            })
        },
        judgeCreateOrChange(){
            let adminInput = {}
            this.getAdminInput(adminInput)
            if(this.model.data.status === 'create'){
                this.create(adminInput)
            }else if(this.model.data.status === 'change'){
                this.change(adminInput)
            }
        },
        getAdminInput(adminInput){
            let data = ['name', 'singer', 'url', 'cover']
            data.map((item)=>{
                adminInput[item] = this.view.o_el.querySelector(`input[name=${item}]`).value
            })
            adminInput['lyrics'] = this.view.o_el.querySelector('textarea').value
        },
        create(adminInput){
            this.model.save(adminInput).then(()=>{
                eventHub.trigger('create', this.model.data.song)
            })
        },
        change(adminInput){
            this.model.update(adminInput).then(()=>{
                eventHub.trigger('change', this.model.data.song) 
            })
        },
        bindEventHub(){
            eventHub.listen('uploadComplete', (data)=>{     //{name:'', url:''}
                this.model.data.status = 'create'
                Object.assign(this.model.data.song, data)
                this.view.render(this.model.data)
            })
            eventHub.listen('select', (id)=>{               //{id:'xx'}
                this.model.data.status = 'change'
                this.model.fetch(id).then(()=>{
                    this.view.render(this.model.data)
                })
            })
        }
    }

    controller.init(view, model)
}