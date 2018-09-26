{
    let view = {
        el: '.uploadSong-inner',
        template:`
            <div class="uploadWrapper-background"></div>
            <div class="uploadWrapper">
                <div class="uploadView">
                    <div class="songImgLi">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-musicFile"></use>
                        </svg>
                    </div>
                    <div class="songDetails">
                        <div class="areaHeader">
                            <span>{name}</span>
                        </div>
                        <div class="areaMiddle">
                            <span>{percent}</span>
                            <span>{loaded}{size}</span>
                        </div>
                        <div class="growBar">
                            <div class="growBarInner"></div>
                        </div>
                    </div>
                </div>
                <div class="uploadSongArea">
                    <div class="drapArea">
                        <input type="file">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-cloudStorage"></use>
                        </svg>
                    </div>
                    <p class="hintDrag">拖曳{songOrCover}文件到此处上传</p>
                    <p class="hintOr">或者</p>
                    <div class="chooseFileButton">
                        <input type="file">
                        选择文件
                    </div>
                </div>
            </div>
        `,
        init(){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
        },
        render(data){
            let newTemplate = this.template
            this.judgeShowOrHidden(data)

            if(data.status === 'song'){
                newTemplate = newTemplate.replace('{songOrCover}', '歌曲')
            }else if(data.status === 'cover'){
                newTemplate = newTemplate.replace('{songOrCover}', '封面')
            }

            newTemplate = newTemplate.replace(`{name}`, data.song.songName)

            let placeholder = ['loaded', 'size', 'percent']
            placeholder.map((item)=>{
                // if( !data.growBarData[`${item}`] ){ data.growBarData[`${item}`] = '' }
                newTemplate = newTemplate.replace(`{${item}}`, data.growBarData[`${item}`])
            })

            this.o_el.innerHTML = newTemplate   
            if(data.growBarData.percent){
                let percentString = data.growBarData.percent
                let percentNumber = percentString.slice(0, percentString.length-1) - 0
                this.o_el.querySelector('.growBarInner').style.cssText = `width:${percentNumber}%`
            }
        },
        judgeShowOrHidden(data){
            if(data.showOrHidden === 'show'){
                this.o_el.parentElement.classList.add('active')
            }else if(data.showOrHidden === 'hidden'){
                this.o_el.parentElement.classList.remove('active')
            }
        }
    }
    let model = {
        data: {
            song: {},   //{songName:'', songUrl:'', coverName:'', coverUrl:''}
            growBarData: {},        // {loaded:'', size:'', percent:''}
            showOrHidden: 'hidden',       // show或者hidden
            status: ''              // song或者cover
        },
        saveToQiNiu(data, callBack){
            let {file, name} = data
            let putExtra = {fname: "",params: {},mimeType: [] || null}
            let config = {useCdnDomain: true,region: qiniu.region.z2}
            return axios.get('http://localhost:8888/uptoken').then((response)=>{
                let token  = response.data.token
                return qiniu.upload(file, name, token, putExtra, config).subscribe(callBack)
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
        bindEventHub(){
            window.eventHub.listen('fileUploadToQiNiu', (data)=>{
                this.model.data.status = data.fileType
                this.model.data.showOrHidden = 'show'
                this.view.render(this.model.data)
            })
        },
        bindEvents(){
            this.view.o_el.addEventListener('change', (ev)=>{
                if(ev.target.getAttribute('type') === 'file'){
                    let file = ev.target.files[0]
                    this.model.saveToQiNiu({file: file, name: file.name}, this.saveToQiNiu_callBack('song'))
                }
            })
        },
        saveToQiNiu_callBack(judgeSongOrCover){
            return {
                next: (response)=>{
                    let loaded = `${Math.ceil(response.total.loaded/1000)}kb`
                    let size = `${Math.ceil(response.total.size/1000)}kb`
                    let percent = `${Math.floor(response.total.percent)}%`
                    Object.assign(this.model.data.growBarData, {loaded:loaded, size:size, percent: percent})
                    this.view.render(this.model.data)
                },
                error: ()=>{
                    console.log('上传出错')
                },
                complete: (response)=>{
                    if(judgeSongOrCover === 'song'){
                        let songName = response.key
                        let songUrl = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(response.key)}`
                        Object.assign(this.model.data.song, {songName: songName, songUrl: songUrl})
                    }else if(judgeSongOrCover === 'cover'){
                        let coverName = response.key
                        let coverUrl = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(response.key)}`
                        Object.assign(this.model.data.song, {coverName: coverName, coverUrl: coverUrl})
                    }
                    this.view.render(this.model.data)
                    window.eventHub.trigger('saveToQiNiuComplete', this.model.data.song)
                }
            }
        },
    }

    controller.init(view, model)
}