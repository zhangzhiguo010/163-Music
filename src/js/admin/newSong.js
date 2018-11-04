{
    let view = new View({
        el: '.newAndEdit-inner',
        data: {
            loaded: '',
            size: '',
            percent: '',
            fileType: '',    // song或cover
            selectedId: ''  // 选择的歌单的id值
        },
        template: `
            <form data-ele="songDetails" class="fileDetails">
                <div class="row">
                    <label>上传歌曲</label>
                    <div class="uploadArea rowContent">
                        <div class="addFile">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-wenjianshangchuan"></use>
                            </svg>
                            添加文件
                        </div>
                        <div class="dragFile">
                            或拖曳文件到这里
                        </div>
                        <input type="file" class="fileUpload" data-ele="song">
                    </div>
                </div>
                <div class="row">
                    <label>上传封面</label>
                    <div class="uploadArea rowContent">
                        <div class="addFile">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-wenjianshangchuan"></use>
                            </svg>
                            添加文件
                        </div>
                        <div class="dragFile">
                            或拖曳文件到这里
                        </div>
                        <input type="file" class="fileUpload" data-ele="cover">
                    </div>
                </div>
                <div class="row">
                    <label for="songName">歌曲名称：</label>
                    <div class="rowContent">
                        <input type="text" id="songName" value="{songName}">
                    </div>
                </div>
                <div class="row">
                    <label>选择所属歌单</label>
                    <select name="playList" id="" class="rowContent"></select>
                </div>
                <div class="row">
                    <label for="singer">演唱</label>
                    <div class="rowContent">
                        <input type="text" id="singer" value="{singer}"> 
                    </div> 
                </div>
                <div class="row">
                    <label for="compose">作曲</label>
                    <div class="rowContent">
                        <input type="text" id="compose" value="{compose}">
                    </div>
                </div>
                <div class="row lyricsRow">
                    <label for="lyrics">歌词</label>
                    <div class="textareaWrap">
                        <textarea name="" id="lyrics" cols="30" rows="10">{lyrics}</textarea>
                    </div>
                </div>
                <div class="handle">
                    <input type="reset" value="取消" class="resetBtn">
                    <input type="submit" value="提交" class="submitBtn">
                </div>
            </form>
        `,
        render(data){
            let newTemplate = this.template
            let placeHolder = ['songName', 'singer', 'compose', 'lyrics'] 
            placeHolder.map((item)=>{
                newTemplate = newTemplate.replace(`{${item}}`, data.song[item] || '')
            })
            this.o_el.innerHTML = newTemplate
            this.createOptions(data)
        },
        createOptions(data){
            if(data.allMenu){
                data.allMenu.map((item, index)=>{
                    let select = this.o_el.querySelector('select[name=playList]')
                    select.add(new Option(item.menuName, item.menuName), index)
                    select.options[index].setAttribute('data-menuId', item.id) 
                    if(item.menuName === data.song.menuName){
                        select.options[index].setAttribute('selected', 'selected')  //设置显示项
                    }
                }) 
            }
        }
    })
    let model = new Model({
        resourceName: 'Song',
        data: {
            song :{},
            allMenu: []
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'song', type: 'change', fn: 'handleUploadFile'},
            {ele: 'cover', type: 'change', fn: 'handleUploadFile'},
            {ele: 'songDetails', type: 'submit', fn: 'handleUploadSong'}
        ],
        eventHub: [
            {type: 'selectTab', fn: 'listenSelectTab'},
            {type: 'clickSongEdit', fn: "listenClickSongEdit"}
        ],
        init(){
            this.view.init()
            this.bindEventHub()
            this.bindEvents()
        },
        listenSelectTab(obj){
            this.view.toggleShowOrHidden(obj.tabName, 'tab_newAndEdit', '.newAndEdit')
            this.view.render(this.model.data)
            this.model.fetchAll('Playlist', 'allMenu').then(()=>{
                this.view.render(this.model.data)
            })
        },
        handleUploadFile(target){
            // 上传文件的类型（歌曲或封面）记录在view的data中
            this.view.data.fileType = target.getAttribute('data-ele')
            let file = target.files[0]
            let name = file.name
            let putExtra = {fname: "",params: {},mimeType: null}
            let config = {useCdnDomain: true,region: qiniu.region.z2}
            axios.get('http://localhost:8888/uptoken').then((responseData)=>{
                let token  = responseData.data.token
                qiniu.upload(file, name, token, putExtra, config).subscribe({
                    next: (responseData)=>{
                        let loaded = `${Math.ceil(responseData.total.loaded/1000)}kb`
                        let size = `${Math.ceil(responseData.total.size/1000)}kb`
                        let percent = `${Math.floor(responseData.total.percent)}%`
                        Object.assign(this.view.data, {loaded:loaded, size:size, percent:percent})
                        // 此处responseData数据是页面展示所用的数据，存在view的data中   
                    },
                    error: (err)=>{
                        alert('err')
                    },
                    complete: (responseData)=>{
                        alert('上传完成')
                        let name = responseData.key
                        let url = `http://phnd1fxw9.bkt.clouddn.com/${encodeURIComponent(responseData.key)}`
                        // 此处responseData数据是数据库返回的数据，存在model的data中
                        if(this.view.data.fileType === 'song'){
                            Object.assign(this.model.data, {songName: name, songUrl: url})
                        }else if(this.view.data.fileType === 'cover'){
                            Object.assign(this.model.data, {coverName: name, coverUrl: url})
                        }
                    }
                })
            })
        },
        // 判断model中是否有id，确定是修改还是新建
        handleUploadSong(){
            this.getAllInput().then((allInput)=>{
                let songId = this.model.data.song.id
                if(songId){
                    this.model.change('Song', songId, allInput).then(()=>{
                        this.model.changeSongPointMenu('Song', 'Playlist', songId, this.view.data.selectedId).then(()=>{
                            window.eventHub.trigger('afterEditSong', this.model.data.songData)
                            this.view.toggleActive('.newAndEdit', 'active')
                        })
                    })
                }else{
                    this.model.saveSongToMenu('Song', 'Playlist', allInput, this.view.data.selectedId, 'song').then(()=>{
                        window.eventHub.trigger('afterNewSong', this.model.data.song) 
                        this.view.toggleActive('.newAndEdit', 'active')
                    })
                    
                } 

            })
            this.view.toggleActive('.newAndEdit', 'deactive')
        },
        // 新建歌曲时，收集所有信息：歌曲名，演唱者，作曲者，歌词，歌单id
        getAllInput(){
            return new Promise((resolve)=>{
                let allInput = {}
                let inputItem = ['songName', 'singer', 'compose']
                let select = this.view.o_el.querySelector('select[name=playList]')
                let index = select.selectedIndex
                let menuName = select.options[index].innerText
                let menuId = select.options[index].getAttribute('data-menuId')
                this.view.data.selectedId = menuId
                allInput.menuName = menuName
                allInput.lyrics = this.view.o_el.querySelector('textarea[id=lyrics]').value
                inputItem.map((item)=>{
                    allInput[item] = this.view.o_el.querySelector(`input[id=${item}]`).value
                })
                let {songUrl, songName, coverUrl, coverName} = this.model.data
                allInput = Object.assign({}, {songUrl: songUrl, songName:songName, coverUrl:coverUrl, coverName:coverName}, allInput)
                resolve(allInput)
            })
        },
        listenClickSongEdit(data){
            this.view.toggleActive('.newAndEdit', 'active')
            this.model.fetch('Song', data.id, 'song').then(()=>{
                this.view.render(this.model.data)
            })
        }
    })
    controller.init.call(controller)
}