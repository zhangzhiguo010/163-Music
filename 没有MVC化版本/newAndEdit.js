{
    let view = {
        el: '.newAndEdit-inner',
        template:`
            <h2>请{newOrUpdate}歌曲信息</h2>
            <div class="allInput">
                <form id="songMessage">
                    <div class="row">
                        <label>上传歌曲</label>
                        <div class="songUploadArea" data-name="songUploadArea">文字</div>
                    </div>
                    <div class="row">
                        <label>上传封面</label>
                        <div class="coverUploadArea" data-name="coverUploadArea"></div>
                    </div>
                    <div class="row">
                        <label for="songUrl"> 歌曲外链：</label>
                        <input type="text" id="songUrl" value="{songUrl}">
                    </div>
                    <div class="row">
                        <label for="coverUrl">封面外链：</label>
                        <input type="text" id="coverUrl" value="{coverUrl}">
                    </div>
                    <div class="row">
                        <label for="songName">歌曲名:</label>
                        <input type="text" id="songName" value="{songName}">
                    </div>
                    <div class="row">
                        <label for="singer">歌手名：</label>
                        <input type="text" id="singer" value="{singer}">
                    </div>
                    <div class="row">
                        <input type="submit" id="submit" form="songMessage" value="点击保存">
                    </div>
                    <div class="row coverView">
                        <div class="coverView-inner">
                            <img src="#" alt="歌曲封面" name="coverImg">
                        </div>
                    </div>
                </form>
                <div class="lyricsWrapper">
                    <textarea name="lyrics" form="newAndEditForm">{lyrics}</textarea>
                </div>
            </div>
        `,
        init(){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
        },
        render(data){
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

                this.o_el.querySelector('img[name=coverImg]').setAttribute('src', data.song.coverUrl)
            }
        },
        toggleShowOrHidden(data){
            if(data === 'show'){
                this.o_el.parentElement.classList.add('active')
            }else if(data === 'hidden'){
                this.o_el.parentElement.classList.remove('active')
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
        fetchFromLeanCloud(id){
            let query = new AV.Query('Song')
            return query.get(id).then((data)=>{
                Object.assign(this.data.song, {id:data.id}, data.attributes)
            })
        },
        saveToLeanCloud(data){
            let Song = AV.Object.extend('Song')
            let song = new Song()
            return song.save(data).then((data)=>{
                let newCreatedAt = this.handleDate(song.createdAt)
                let newUpdatedAt = this.handleDate(song.updatedAt)
                Object.assign(this.data.song, 
                    {id:song.id, createdAt:newCreatedAt, updatedAt:newUpdatedAt}, 
                    data.attributes
                )
            })
        },
        handleDate(date){
            let year = date.getFullYear()
            let month = date.getMonth()+1
            let day = date.getDate()
            return `${year}.${month}.${day}`
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
            this.view.init()
            this.view.render(this.model.data)
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents(){
            this.view.o_el.addEventListener('click', (ev)=>{
                if(ev.target.getAttribute('data-name') === 'songUploadArea'){
                    window.eventHub.trigger('fileUploadToQiNiu', {fileType: 'song'})
                }else if(ev.target.getAttribute('data-name') === 'coverUploadArea'){
                    window.eventHub.trigger('fileUploadToQiNiu', {fileType: 'cover'})
                }
            })

            this.view.o_el.addEventListener('submit', (ev)=>{
                ev.preventDefault()
                if(ev.target.nodeName.toLowerCase() === 'form'){
                     //保存歌曲名、歌手名、歌曲外链、封面外链、歌词
                    let inputData = {}     
                    this.getInputData(inputData)
                    if(this.model.data.status === 'new'){
                        this.model.saveToLeanCloud(inputData).then(()=>{
                            this.view.render(this.model.data)
                            window.eventHub.trigger('newSongComplete', this.model.data.song)
                        })
                    }else if(this.model.data.status === 'update'){
                        this.model.updateToLeanCloud(inputData).then(()=>{
                            this.view.render(this.model.data)
                            window.eventHub.trigger('updateComplete', this.model.data)
                        })
                    }
                    window.eventHub.trigger('selectTab', {tabName: 'tab_songList'})
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
            window.eventHub.listen('saveToQiNiuComplete', (data)=>{
                Object.assign(this.model.data.song, data)
                this.view.render(this.model.data)
            })
        },
        getInputData(inputData){
            let data = ['songName', 'singer', 'songUrl', 'coverUrl']
            data.map((item)=>{
                inputData[item] = this.view.o_el.querySelector(`input[id=${item}]`).value
            })
            inputData.lyrics = this.view.o_el.querySelector('textarea').innerText
            return inputData
        }
    }

    controller.init(view, model)
}