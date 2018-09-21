{
    let view = {
        el: '.songOthers-inner',
        template:`
            <h1>其他信息</h1>
            <div>
                上传进度展示
            </div>
            <div>
                歌曲封面展示
            </div>


        `,
        render(data){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
            let newTemplate = this.template

            let placeholder = ['name', 'loaded', 'size', 'percent']
            placeholder.map((item)=>{
                if( !data.song[`${item}`] ){ data.song[`${item}`] = '' }
                newTemplate = newTemplate.replace(`{${item}}`, data.song[`${item}`])
            })
            this.o_el.innerHTML = newTemplate

            if(data.song.percent){
                let percentString = data.song.percent
                let percentNumber = percentString.slice(0, data.song.percent.length-1)
                this.o_el.querySelector('.growBarInner').style.cssText = `width:${percentNumber}%`
            }
        }
    }
    let model = {
        data: {
            song: {}
        },
        cancelObject: {},
        save(data, callback){
            let file = data
            let name = data.name
            let putExtra = {fname: "",params: {},mimeType: [] || null}
            let config = {useCdnDomain: true,region: qiniu.region.z2}
            return axios.get('http://localhost:8888/uptoken').then((response)=>{
                let token  = response.data.token
                cancelObject = qiniu.upload(file, name, token, putExtra, config).subscribe(callback)
            })
        },
        cansole(){
            cancelObject.unsubscribe()
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
            this.bindEventHub()  
        },
        bindEventHub(){},
        bindEvents(){
            this.view.o_el.addEventListener('change', (ev)=>{
                if(ev.target.nodeName.toLowerCase() === 'form'){
                    let file = ev.currentTarget.files[0]
                    this.model.data.song.name = file.name
                    this.model.save(file, this.callback())
                }
            })



            // this.view.o_el.querySelector('input[type=file]').addEventListener('change', (ev)=>{
            //     this.model.data.song.name = ev.currentTarget.files[0].name
            //     this.model.save(ev.currentTarget.files[0], this.saveCallBack())
            //     eventHub.trigger('uploadBefore')
            // })
            this.view.o_el.addEventListener('click', (ev)=>{
                if(ev.target.nodeName.toLowerCase() === 'svg'){
                    this.model.cansole(cancelObject)
                }
            })

        },
        saveCallBack(){
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
        }
    }

    controller.init(view, model)
}







{
    // <form class="fileUpload">
    //     <p>请选择文件或拖曳至此上传文件</p>
    //     <input type="file">
    // </form>
    // <form class="coverUpload">
    //     <p>请选择文件或拖曳至此上传文件</p>
    //     <input type="file">
    // </form>
}

{/* <form class="uploadCartoon">
    <div class="fileIcon">
        <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-musicFile"></use>
        </svg>
    </div>
    <div class="fileName">
        <p>{name}这里是个名</p>
    </div>
    <div class="fileUploadCansole">
        <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-closeButton"></use>
        </svg>
    </div>
    <div class="fileGrowBar">
        <div class="growBarOuter"><div class="growBarInner"></div></div>
    </div>
    <div class="fileGrowHint">
        <p>{loaded} {size} {percent}</p>
    </div>
    <div class="fileDelete">
        <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-dustbin"></use>
        </svg>
    </div>
</form> */}
