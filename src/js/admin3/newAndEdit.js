{
    let view = {
        el: '.newAndEdit',
        template:`
            <h2>请{newOrUpdate}歌曲信息</h2>
            <hr>
            <div>
                <form id="newAndEditForm">
                    <label>
                        <span>歌名</span>
                        <input type="text" name="songName" value="{songName}">
                    </label>
                    <label>
                        <span>歌手</span>
                        <input type="text" name="singer" value="{singer}">
                    </label>
                    <label>
                        <span>歌曲</span>
                        <div class="songFileUploadButton">上传歌曲</div>
                    </label>
                    <label>
                        <span>封面</span>
                        <div class="coverFileUploadButton">上传封面</div>
                    </label>
                    <label>
                        <span>歌曲外链</span>
                        <input type="text" name="songUrl" value="{songUrl}">
                    </label>
                    <label>
                        <span>封面外链</span>
                        <input type="text" name="coverUrl" value="{coverUrl}">
                    </label>
                    <input type="submit">
                    <div class="coverWrapper">
                        <img src="" alt="封面" name="cover">
                    </div>
                </form>
                <textarea name="lyrics" form="newAndEditForm">{lyrics}</textarea>
            </div>
        `,
        render(data){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template

            let newTemplate = this.template
            let placeholder = ['songName', 'singer', 'songUrl', 'coverUrl']
            placeholder.map((item)=>{
                if(!data.song[item]){ data.song[item]='' }
                newTemplate = newTemplate.replace(`{${item}}`, data.song[item])
            })
            if(data.status === 'new'){
                newTemplate = newTemplate.replace('{newOrUpdate}', '完善')
            }else if(data.status === 'update'){
                newTemplate = newTemplate.replace('{newOrUpdate}', '修改')
            }
            if(!data.song.lyrics){
                data.song.lyrics = ''
            }
            newTemplate = newTemplate.replace('{lyrics}', data.song.lyrics)
            this.o_el.innerHTML = newTemplate

            if(data.song.coverUrl){

                this.o_el.querySelector('img[name=cover]').setAttribute('src', data.song.coverUrl)
            }
        },
        toggleShowOrHidden(data){
            if(data === 'show'){
                this.o_el.classList.add('active')
            }else if(data === 'hidden'){
                this.o_el.classList.remove('active')
            }
            
        }
    }
    let model = {
        data: {
            // 对象模型：{name:'', singer:'', songUrl:'', coverUrl:'', lyrics:''}
            song: {},
            // 对象模型：{loaded:'', size:'', percent:''}
            growBarData: {},
            // 两种状态：new或者update
            status: 'new'

        },
        fetchFromQiNiu(){},
        saveToQiNiu(data, saveToQiNiu_callBack){
            let {file, name} = data
            let putExtra = {fname: "",params: {},mimeType: [] || null}
            let config = {useCdnDomain: true,region: qiniu.region.z2}
            return axios.get('http://localhost:8888/uptoken').then((response)=>{
                let token  = response.data.token
                qiniu.upload(file, name, token, putExtra, config).subscribe(saveToQiNiu_callBack)
            })
        },
        fetchFromLeanCloud(id){
            let query = new AV.Query('Song')
            return query.get(id).then((data)=>{
                Object.assign(this.data.song, {id:data.id}, data.attributes)
                // console.log(this.data.song)
            })
        },
        saveToLeanCloud(data){
            let Song = AV.Object.extend('Song')
            let song = new Song()
            return song.save(data).then((data)=>{
                Object.assign(this.data.song, {id:data.id}, data.attributes)
            })
        },
        updateToLeanCloud(data){
            let song = AV.Object.createWithoutData('Song', this.data.song.id);
            for(let key in data){
                song.set(`${key}`, `${data[key]}`)
            }
            return song.save().then((song)=>{
                Object.assign(this.data.song, {id:song.id}, song.attributes)
            })
        },
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
            // this.view.o_el.addEventListener('change', (ev)=>{
            //     if(ev.target.nodeName.toLowerCase() === 'input'){
            //         if(ev.target.getAttribute('class') === 'songFile_hidden'){
            //             console.log('保存歌曲文件到七牛')
            //             let songFile = ev.target.files[0]
            //             this.model.saveToQiNiu({file:songFile, name:songFile.name}, this.saveToQiNiu_callBack('songFile'))
            //         }else if(ev.target.getAttribute('class') === 'coverFile_hidden'){
            //             console.log('保存封面照片到七牛')
            //             let coverFile = ev.target.files[0]
            //             this.model.saveToQiNiu({file:coverFile, name:coverFile.name}, this.saveToQiNiu_callBack('coverFile'))
            //         }
            //     }
            // })


            this.view.o_el.addEventListener('click', (ev)=>{
                if(ev.target.getAttribute('class') === 'songFileUploadButton'){
                    console.log('歌曲上传按钮被点击')
                    window.eventHub.trigger('fileUploadToQiNiu', {fileType: 'song'})
                }else if(ev.target.getAttribute('class') === 'coverFileUploadButton'){
                    console.log('封面上传按钮被点击')
                    window.eventHub.trigger('fileUploadToQiNiu', {fileType: 'cover'})
                }
            })

            this.view.o_el.addEventListener('submit', (ev)=>{
                if(ev.target.nodeName.toLowerCase() === 'form'){
                    ev.preventDefault()
                     //保存歌曲名、歌手名、歌曲外链、封面外链、歌词
                    let inputData = {}     
                    this.getInputData(inputData)
                    if(this.model.data.status === 'new'){
                        console.log('新建歌曲，保存数据到leadCloud')
                        this.model.saveToLeanCloud(inputData).then(()=>{
                            this.view.render(this.model.data)
                        })
                    }else if(this.model.data.status === 'update'){
                        console.log('更新歌曲，保存数据到leadCloud')
                        this.model.updateToLeanCloud(inputData).then(()=>{
                            this.view.render(this.model.data)
                            window.eventHub.trigger('updateComplete', this.model.data)
                        })
                    }

                   

                }
            })
        },
        bindEventHub(){
            window.eventHub.listen('selectTab', (data)=>{
                if(data.tabName === 'tab_newAndEdit'){
                    this.view.toggleShowOrHidden('show')
                    this.view.render(this.model.data)
                }else{
                    this.view.toggleShowOrHidden('hidden')
                }
            })
            window.eventHub.listen('selecteSong', (data)=>{
                this.model.data.status = 'update'
                this.model.fetchFromLeanCloud(data.id).then(()=>{
                    this.view.render(this.model.data)
                })
            })
        },
        saveToQiNiu_callBack(judgeSongOrCover){
            return {
                next: (response)=>{
                    this.model.data.status = 'new'
                    let loaded = `${Math.ceil(response.total.loaded/1000)}kb`
                    let size = `${Math.ceil(response.total.size/1000)}kb`
                    let percent = `${Math.floor(response.total.percent)}%`
                    Object.assign(this.model.data.growBarData, {loaded:loaded, size:size, percent: percent})
                    window.eventHub.trigger('upload', {loaded:loaded, size:size, percent:percent})
                },
                error: ()=>{
                    console.log('上传出错')
                },
                complete: (response)=>{
                    if(judgeSongOrCover === 'songFile'){
                        console.log('上传歌曲文件成功')
                        this.model.data.status = 'new'
                        let songName = response.key
                        let songUrl = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(response.key)}`
                        Object.assign(this.model.data.song, {songName: songName, songUrl: songUrl})
                    }else if(judgeSongOrCover === 'coverFile'){
                        console.log('上传封面照片成功')
                        let coverName = response.key
                        let coverUrl = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(response.key)}`
                        Object.assign(this.model.data.song, {coverName: coverName, coverUrl: coverUrl})
                    }
                    this.view.render(this.model.data)
                }
            }
        },
        getInputData(inputData){
            let data = ['songName', 'singer', 'songUrl', 'coverUrl']
            data.map((item)=>{
                inputData[item] = this.view.o_el.querySelector(`input[name=${item}]`).value
            })
            inputData.lyrics = this.view.o_el.querySelector('textarea').innerText
            return inputData
        }
    }

    controller.init(view, model)
}