{
    let view = new View({
        el: '.newAndEdit-inner',
        data: {
            status: '添加',     // 三种状态：添加、完善、修改
        },
        template:`
            <h2>请{newOrUpdate}歌曲</h2>
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
                        <label for="playList">所属歌单：</label>
                        <input type="text" id="playList" value="{playList}">
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
            let placeholder = ['songName', 'singer', 'songUrl', 'coverUrl', 'playList']
            newTemplate = newTemplate.replace('{newOrUpdate}', this.data.status)
            placeholder.map((item)=>{
                newTemplate = newTemplate.replace(`{${item}}`, data[item])
            })
            this.o_el.innerHTML = newTemplate         
        },
        renderCoverPicture(data){
            if(data.song.coverUrl){
                this.o_el.querySelector('img[name=coverImg]').setAttribute('src', data.song.coverUrl)
            }
        }
    })

    let model = new Model({
        resourceName: 'Song',
        data: {
            songName: '',
            singer: '',
            songUrl: '',
            coverUrl: '',
            lyrics: '',
            createdAt: '',
            updatedAt: '',
            playList: '',
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
            window.eventHub.trigger('fileUploadToQiNiu', {fileType: '歌曲'})
        },
        triggerCoverUpload(){
            window.eventHub.trigger('fileUploadToQiNiu', {fileType: '封面'})
        },
        NewOrUploadSong(target, ev){
            let inputData = {}
            let data = ['songName', 'singer', 'songUrl', 'coverUrl', 'playList']
            data.map((item)=>{
                inputData[item] = this.view.o_el.querySelector(`input[id=${item}]`).value
            })
            inputData.lyrics = this.view.o_el.querySelector('textarea').innerText
            this.saveToLeanCloud_proxy(inputData).then(()=>{
                if(this.view.data.status === '修改'){
                    console.log('修改')
                    window.eventHub.trigger('selectTab', {tabName: 'tab_songList'})
                    window.eventHub.trigger('updateSongComplete', this.model.data)
                }else if(this.view.data.status === '新建'){
                    window.eventHub.trigger('selectTab', {tabName: 'tab_songList'})
                    window.eventHub.trigger('newSongComplete', this.model.data)
                }  
            })
        },
        afterSelectTab(data){
            if(data.tabName === 'tab_newAndEdit'){
                this.view.toggleActive2('.newAndEdit', 'active')
                this.view.render(this.model.data)
            }else{
                this.view.toggleActive2('.newAndEdit', 'deactive')
            }
        },
        afterSelecteSong(data){
            this.view.data.status = '修改'
            // 掉进陷阱：自动更新页面
            this.fetchFromLeanCloud_proxy(data.id)
        },
        afterSaveToQiNiuComplete(obj){
            Object.assign(this.view.data, {status: '完善'})
            if(obj.fileType === '歌曲'){
                Object.assign(this.model.data, {songName: obj.data.name, songUrl: obj.data.url})
            }else if(obj.fileType === '封面'){
                Object.assign(this.model.data, {coverName: obj.data.name, coverUrl: obj.data.url})
            }
            this.view.render(this.model.data)
        }
    })

    controller.init()
}
