{
    let view = new View2({
        el: '.newMenu-inner',
        data: {
            fileType: 'cover',
            selectedId: ''  //记录编辑按钮被点击的那个歌单的id值
        },
        template: `
            <form data-ele="songMenuDetails" class="fileDetails">
                <div class="row" id="songMenuCover">
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
                    <label for="songMenuName">歌单名称：</label>
                    <div class="rowContent">
                        <input type="text" id="menuName" value="{menuName}">
                    </div>
                </div>
                <div class="row">
                    <label for="creator">创建者</label>
                    <div class="rowContent">
                        <input type="text" id="creator" value="{creator}"> 
                    </div> 
                </div>
                <div class="row lyricsRow">
                    <label for="description">歌单描述</label>
                    <div class="textareaWrap">
                        <textarea name="" id="description" cols="30" rows="10">{description}</textarea>
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
            let placeHolder = ['menuName', 'creator', 'description']
            placeHolder.map((item)=>{
                newTemplate = newTemplate.replace(`{${item}}`, data[item] || '')
            })
            this.o_el.innerHTML = newTemplate
        }
    })

    let model = new Model2({
        // {menuName: '', creator: '', description: ''， coverUrl: ''}
        data: {}
    })

    let controller = new Controller2({
        view: view,
        model: model,
        events: [
            {ele: 'cover', type: 'change', fn: 'handleUploadFile'},
            {ele: 'songMenuDetails', type: 'submit', fn: 'handleUploadMenu'}
        ],
        eventHub: [
            {type: 'selectTab', fn: 'listenSelectTab'},
            {type: 'editMenu', fn: 'listenEditMenu'}
        ],
        init(){
            this.view.init()
            this.bindEvents()
            this.bindEventHub()
        },
        // 判断显示还是隐藏
        listenSelectTab(obj){
            if(obj.tabName === 'tab_newMenu'){
                document.querySelector('.newMenu').classList.add('active')
                this.model.data = {}
                this.view.init()
                this.view.render(this.model.data)
            }else{
                document.querySelector('.newMenu').classList.remove('active')
            }
        },
        listenEditMenu(obj){         
            // 显示页面
            document.querySelector('.newMenu').classList.add('active')
            // 获得歌曲信息
            let menuStorage = new AV.Query('Playlist')
            menuStorage.get(obj.id).then((responseData)=>{
                // 更新本地数据, 并渲染页面
                let menuId = responseData.id
                let {menuName, creator, description, coverUrl} = responseData.attributes
                Object.assign(
                    this.model.data,
                    {
                        menuId: menuId,
                        menuName: menuName,
                        creator: creator,
                        description: description,
                        coverUrl: coverUrl
                    }
                )
                // 渲染页面
                this.view.init()
                this.view.render(this.model.data)
            })
        },
        handleUploadMenu(){
            // 收集所有用户信息
            this.getAllInput().then((allInput)=>{
                // 判断是修改还是新建
                if(this.model.data.menuId){
                    // 更新数据库
                    let menuStorage = AV.Object.createWithoutData('Playlist', this.model.data.menuId)
                    for(let key in allInput){
                        menuStorage.set(key, allInput[key])
                    }
                    menuStorage.save().then((responseData)=>{
                        // 更新本地存储
                        let menuId = responseData.id
                        let {menuName, creator, description, coverUrl} = responseData.attributes
                        Object.assign(
                            this.model.data,
                            {
                                menuId: menuId,
                                menuName: menuName,
                                creator: creator,
                                description: description,
                                coverUrl: coverUrl
                            }
                        )
                        // 事件触发：歌单修改完成
                        window.eventHub.trigger('editMenuComplete', this.model.data)
                        document.querySelector('.newMenu').classList.remove('active')
                    })
                }else{
                    // 保存到数据库
                    let  Store = AV.Object.extend('Playlist')
                    let menuStorage = new Store()
                    menuStorage.save(allInput).then((responseData)=>{
                        // 更新本地存储
                        let menuId = responseData.id
                        let {menuName, creator, description, coverUrl} = responseData.attributes 
                        Object.assign(
                            this.model.data,
                            {
                                menuId: menuId,
                                menuName: menuName,
                                creator: creator,
                                description: description,
                                coverUrl: coverUrl
                            }
                        )
                        // 触发事件：歌曲修改完成
                        window.eventHub.trigger('newMenuComplete', this.model.data)
                        document.querySelector('.newMenu').classList.remove('active')
                    })
                }
            })
        },
        
        // 新建歌单时，收集所有信息：歌单名，创建者，歌单描述, 封面外链
        getAllInput(){
            return new Promise((resolve)=>{
                let allInput = {}
                let inputItem = ['menuName', 'creator']
                allInput.description = this.view.o_el.querySelector('textarea[id=description]').value
                inputItem.map((item)=>{
                    allInput[item] = this.view.o_el.querySelector(`input[id=${item}]`).value
                })
                allInput = Object.assign({}, {coverUrl: this.model.data.coverUrl}, allInput)
                resolve(allInput)
            })
        },

        handleUploadFile(target){
            let file = target.files[0]
            let name = file.name
            let putExtra = {fname: "",params: {},mimeType: [] || null}
            let config = {useCdnDomain: true,region: qiniu.region.z2}
            axios.get('http://localhost:8888/uptoken').then((response)=>{
                let token  = response.data.token
                qiniu.upload(file, name, token, putExtra, config).subscribe({
                    next: ()=>{},
                    error: ()=>{alert('上传出错，请刷新后重试！')},
                    complete: (responseData)=>{
                        this.model.data.coverUrl = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(responseData.key)}`
                    }
                })
            })
        }
    })

    controller.init()
}