{
    let view = {
        el: '.uploadWrapper',
        template:`
            <div class="uploadWrapper-inner">
                <div>
                    {songOrCover}
                    <input type="file" class="uploadFile">
                    <div class="cansoleBtn">按钮</div>
                    <div class="growBarOuter">
                        <div class="growBarInner" style="width:0%"></div>
                    </div>
                </div>
            </div>
        `,
        render(data){
            this.o_el = document.querySelector(this.el)
            let newTemplate = this.template
            this.toggleShowOrHidden(data.showOrHidden)
            this.upladeTemplate(data, newTemplate).then((newTemplate)=>{
                this.o_el.innerHTML = newTemplate
                if(data.growBarData.percent){
                    let percentString = data.growBarData.percent
                    let percentNumber = percentString.slice(0, percentString.length-1) - 0
                    this.o_el.querySelector('.growBarInner').style.cssText = `width:${percentNumber}%`
                }
            })
            
        },
        toggleShowOrHidden(key){
            if(key === 'show'){
                this.o_el.classList.add('active')
            }else if(key === 'hidden'){
                this.o_el.classList.remove('active')
            }
        },
        upladeTemplate(data, newTemplate){
            return new Promise((resolve)=>{
                if(data.status === 'song'){
                    newTemplate = newTemplate.replace('{songOrCover}', '上传歌曲')
                }else if(data.status === 'cover'){
                    newTemplate = newTemplate.replace('{songOrCover}', '上传封面')
                }else if(data.status === ''){
                    newTemplate = newTemplate.replace('{songOrCover}', '')
                }
                resolve(newTemplate)
            })
        }
    }
    let model = {
        data: {
            song: {},
            growBarData: {},        // {loaded:'', size:'', percent:''}
            showOrHidden: '',       // show或者hidden
            status: ''              // song或者cover
        },
        saveToQiNiu(data, saveToQiNiu_callBack){
            let {file, name} = data
            let putExtra = {fname: "",params: {},mimeType: [] || null}
            let config = {useCdnDomain: true,region: qiniu.region.z2}
            return axios.get('http://localhost:8888/uptoken').then((response)=>{
                let token  = response.data.token
                qiniu.upload(file, name, token, putExtra, config).subscribe(saveToQiNiu_callBack)
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
        bindEventHub(){
            window.eventHub.listen('fileUploadToQiNiu', (data)=>{
                this.model.data.status = data.fileType
                this.model.data.showOrHidden = 'show'
                this.view.render(this.model.data)
            })
        },
        bindEvents(){
            this.view.o_el.addEventListener('change', (ev)=>{
                if(ev.target.getAttribute('class') === 'uploadFile'){
                    let file = ev.target.files[0]
                    this.model.saveToQiNiu({file: file, name: file.name}, this.saveToQiNiu_callBack(this.model.data.status)).then(()=>{
                        console.log('文件上传成功')
                    })
                }
            })

            this.view.o_el.addEventListener('click', (ev)=>{
                if(ev.target.getAttribute('class') === 'cansoleBtn'){
                    this.model.data.showOrHidden = 'hidden'
                    this.view.render(this.model.data)
                }
            })
        },
        saveToQiNiu_callBack(judgeSongOrCover){
            console.log(judgeSongOrCover)
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
                        console.log('上传歌曲文件成功')
                        let songName = response.key
                        let songUrl = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(response.key)}`
                        Object.assign(this.model.data.song, {songName: songName, songUrl: songUrl})
                    }else if(judgeSongOrCover === 'cover'){
                        console.log('上传封面照片成功')
                        let coverName = response.key
                        let coverUrl = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(response.key)}`
                        Object.assign(this.model.data.song, {coverName: coverName, coverUrl: coverUrl})
                    }
                }
            }
        },
    }

    controller.init(view, model)
}