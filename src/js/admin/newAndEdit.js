{
    let view = new View({
        el: '.newAndEdit-inner',
        template:`
            <h2>请{newOrUpdate}歌曲信息</h2>
            <div class="allInput">
                <form id="songMessage" data-ele="form">
                    <div class="row">
                        <label>上传歌曲</label>
                        <div class="songUploadArea" data-ele="songUploadArea"></div>
                    </div>
                    <div class="row">
                        <label>上传封面</label>
                        <div class="coverUploadArea" data-ele="coverUploadArea"></div>
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
                    <textarea name="lyrics" form="songMessage">{lyrics}</textarea>
                </div>
            </div>
        `,
        render(data){
            let newTemplate = this.template
            this.placeholder.map((item)=>{
                if(!data[item]){ data[item]='' }
                newTemplate = newTemplate.replace(`{${item}}`, data[item])
            })
            if(data.status === 'new'){
                newTemplate = newTemplate.replace('{newOrUpdate}', '完善')
            }else if(data.status === 'update'){
                newTemplate = newTemplate.replace('{newOrUpdate}', '修改')
            }
            this.o_el.innerHTML = newTemplate
        },
        placeholder: ['songName', 'singer', 'songUrl', 'coverUrl', 'lyrics'],
        renderCoverPicture(data){
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
    })

    let model = new Model({
// 对象模型：{name:'', singer:'', songUrl:'', coverUrl:'', lyrics:'', loaded:'', size:'', percent:'', status:''}
        data: { status: 'new' },
        resourceName: 'Song',
        afterFetch(responseData){
            Object.assign(this.data, {id:responseData.id}, responseData.attributes)
        },
        afterSave(responseData){
            let newCreatedAt = this.handleDate(responseData.createdAt)
            let newUpdatedAt = this.handleDate(responseData.updatedAt)
            Object.assign(this.data, 
                {id:responseData.id, createdAt:newCreatedAt, updatedAt:newUpdatedAt}, 
                responseData.attributes)
        },
        afterUpdate(responseData){
            Object.assign(this.data, {id:responseData.id}, responseData.attributes)
        },
        handleDate(date){
            let year = date.getFullYear()
            let month = date.getMonth()+1
            let day = date.getDate()
            return `${year}.${month}.${day}`
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'songUploadArea', type: 'click', fn: 'triggerSongUpload'},
            {ele: 'coverUploadArea', type: 'click', fn: 'triggerCoverUpload'},
            {ele: 'form', type: 'submit', fn:'NewOrUploadSong'}
        ],
        eventHub: [
            {type: 'selectTab', fn: 'afterSelectTab'},
            {type: 'selecteSong', fn: 'afterSelecteSong'},
            {type: 'saveToQiNiuComplete', fn: 'afterSaveToQiNiuComplete'}
        ],
        init(){
            this.view.render(this.model.data)
        },
        triggerSongUpload(){
            window.eventHub.trigger('fileUploadToQiNiu', {fileType: 'song'})
        },
        triggerCoverUpload(){
            window.eventHub.trigger('fileUploadToQiNiu', {fileType: 'cover'})
        },
        NewOrUploadSong(target, ev){
            let inputData = {}
            let data = ['songName', 'singer', 'songUrl', 'coverUrl']
            data.map((item)=>{
                inputData[item] = this.view.o_el.querySelector(`input[id=${item}]`).value
            })
            inputData.lyrics = this.view.o_el.querySelector('textarea').innerText
            if(this.model.data.status === 'new'){
                // 掉进陷阱：自动更新页面
                this.saveToLeanCloud_proxy(inputData)
            }else if(this.model.data.status === 'update'){
                // 掉进陷阱：自动更新页面
                this.updateToLeanCloud_proxy(inputData)
            }
        },
        afterSelectTab(data){
            if(data.tabName === 'tab_newAndEdit'){
                this.view.toggleShowOrHidden('show')
                this.view.render(this.model.data)
            }else{
                this.view.toggleShowOrHidden('hidden')
            }
        },
        afterSelecteSong(data){
            this.model.data.status = 'update'
            // 掉进陷阱：自动更新页面
            this.fetchFromLeanCloud_proxy(data.id)
        },
        afterSaveToQiNiuComplete(data){
            Object.assign(this.model.data, data)
            this.view.render(this.model.data)
        }
    })

    controller.init()
}
