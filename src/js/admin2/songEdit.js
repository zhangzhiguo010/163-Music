{
    let view = {
        el: '.songEdit-inner',
        template:`
            <h1>{createOrChange}</h1>
            <form class="uploadToQiNiu">
                <p>上传歌曲</p>
                <input type="file" class="uploadSong">
            </form>
            <form class="uploadToQiNiu">
                <p>上传封面</p>
                <input type="file" class="uploadCover">
            </form>
            <form class="uploadToLeanCloud">
                <label>
                    <span>歌曲</span>
                    <input type="text" name="name" value="{songName}">
                </label>
                <label>
                    <span>歌手</span>
                    <input type="text" name="singer" value="{singer}">
                </label>
                <label>
                    <span>外链</span>
                    <input type="text" name="url" value="{songUrl}">
                </label>
                <input type="submit" name="save" value="点击保存" id="submit">
            </form>
        `,
        render(data){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template

            let placeholder = ['songId', 'songName', 'singer', 'songUrl']
            let newTemplate = this.template
            placeholder.map((item)=>{
                if(!data.song[item]){data.song[item] = ''}
                newTemplate = newTemplate.replace(`{${item}}`, data.song[item])
            })

        //     if(data.status === 'create'){
        //         newTemplate = newTemplate.replace('{createOrChange}', '歌曲新建')
        //     }else if(data.status === 'change'){
        //         newTemplate = newTemplate.replace('{createOrChange}', '歌曲修改')
        //     }
            document.querySelector(this.el).innerHTML = newTemplate 
        }
    }
    let model = {
        data: {
            song: {},   // {songId:'', songName:'', songUrl:'', coverName:'', coverUrl:'', singer:''}
            status: 'create'
        },
        fetchFromQiNiu(){},
        saveToQiNiu(data, callback){
            let {file, name} = data
            let putExtra = {fname: "",params: {},mimeType: [] || null}
            let config = {useCdnDomain: true,region: qiniu.region.z2}
            return axios.get('http://localhost:8888/uptoken').then((response)=>{
                let token  = response.data.token
                cancelObject = qiniu.upload(file, name, token, putExtra, config).subscribe(callback)
            })
        },
        fetchFromLeanCloud(){},
        saveToLeanCloud(){}
        // fetchFromLeanCloud(id){
        //     let query = new AV.Query('Song')
        //     return query.get(id).then((song)=>{
        //         this.updateModelData(song)
        //     })
        // },
        // saveToLeanCloud(data){
        //     let Song = AV.Object.extend('Song');
        //     let song = new Song();
        //     return song.save(data).then((song)=>{
        //         this.updateModelData(song)
        //     })
        // },
        // updateDB(data){
        //     let song = AV.Object.createWithoutData('Song', this.data.song.id);
        //     for(let key in data){
        //         song.set(`${key}`, `${data[key]}`)
        //     }
        //     return song.save().then((song)=>{
        //         this.updateModelData(song)
        //     })
        // },
        // updateModelData(data){
        //     Object.assign(this.data.song, {id:data.id}, data.attributes)
        // }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEventHub()
            this.bindEvents()
        },
        bindEventHub(){
            // eventHub.listen('uploadComplete', (data)=>{     //{name:'', url:''}
            //     this.model.data.status = 'create'
            //     Object.assign(this.model.data.song, data)
            //     this.view.render(this.model.data)
            // })
            // eventHub.listen('select', (id)=>{               //{id:'xx'}
            //     this.model.data.status = 'change'
            //     this.model.fetch(id).then(()=>{
            //         this.view.render(this.model.data)
            //     })
            // })
        },
        bindEvents(){
            this.view.o_el.querySelector('input[type=file]').addEventListener('change', (ev)=>{ 
                console.log('保存文件到七牛')
                let songFile = ev.currentTarget.files[0]
                let songName = songFile.name
                this.model.saveToQiNiu({file:songFile, name:songName}, this.saveToQiNiuCallBack)
            })

            this.view.o_el.addEventListener('submit', (ev)=>{
                if(ev.target.nodeName.toLowerCase() === 'form'){
                    ev.preventDefault()
                    console.log('保存数据到leanCloud')
                    this.judgeCreateOrChange()
                }
            })
        },
        saveToQiNiuCallBack(){
            return {
                next: (response)=>{
                    let loaded = `${Math.ceil(response.total.loaded/1000)}kb`
                    let size = `${Math.ceil(response.total.size/1000)}kb`
                    let percent = `${Math.floor(response.total.percent)}%`
                    Object.assign(this.model.data.song, {loaded:loaded, size:size, percent: percent})
                    this.view.render(this.model.data)
                    eventHub.trigger('uploading') 
                },
                error: ()=>{
                    console.log('上传出错')
                },
                complete: (response)=>{
                    console.log('上传成功')
                    let name = response.key
                    let url = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(response.key)}`
                    Object.assign(this.model.data.song, {name: name, url: url})
                    eventHub.trigger('uploadComplete', this.model.data.song) 
                }
            }
        },
        judgeCreateOrUpdate(){
            let adminInput = {}     //保存用户输入的所有信息
            this.getAdminInput(adminInput)
            if(this.model.data.status === 'create'){
                console.log(`用户`)
                this.create(adminInput)
            }else if(this.model.data.status === 'change'){
                this.update(adminInput)
            }
        },
        getAdminInput(adminInput){
            let data = ['name', 'singer', 'url']
            data.map((item)=>{
                return adminInput[item] = this.view.o_el.querySelector(`input[name=${item}]`).value
            })
        },
        create(adminInput){
            this.model.save(adminInput).then(()=>{
                eventHub.trigger('create', this.model.data.song)
            })
        },
        update(adminInput){
            this.model.updateDB(adminInput).then(()=>{
                eventHub.trigger('update', this.model.data.song) 
            })
        }
    }

    controller.init(view, model)
}