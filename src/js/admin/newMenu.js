{
    let view = new View({
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
                newTemplate = newTemplate.replace(`{${item}}`, data.menu[item] || '')
            })
            this.o_el.innerHTML = newTemplate
        }
    })

    let model = new Model({
        data: {
            menu: {}
        }
    })

    let controller = new Controller({
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
            this.view.toggleShowOrHidden(obj.tabName, 'tab_newMenu', '.newMenu')
            this.view.render(this.model.data)
        },
        listenEditMenu(obj){         
            this.view.toggleActive('.newMenu', 'active')
            this.model.fetch('Playlist', obj.id, 'menu').then(()=>{
                this.view.render(this.model.data)
            })
        },
        handleUploadMenu(){
            this.getAllInput().then((allInput)=>{
                // 有id值就是修改，没有id值就是新建
                let id = this.model.data.menu.id
                if(id){
                    this.model.change('Playlist', id, allInput, 'menu').then(()=>{
                        window.eventHub.trigger('afterEditMenu', this.model.data.menu)
                        this.view.toggleActive('.newMenu', 'deactive')
                    })
                }else{
                    this.model.save('Playlist', allInput, 'menu').then(()=>{
                        window.eventHub.trigger('afterNewMenu', this.model.data.menu)
                        this.view.toggleActive('.newMenu', 'deactive')
                    })
                }
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
                        this.model.data.coverUrl = `http://phnd1fxw9.bkt.clouddn.com/${encodeURIComponent(responseData.key)}`
                    }
                })
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
    })

    controller.init()
}