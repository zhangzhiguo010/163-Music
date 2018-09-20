{
    let view = {
        el: '#uploadSong',
        template:`
            <div class="uploadSong-inner">
                <h3>歌曲上传</h3>
                <form>
                    <input type="file" class="uploadArea">
                    <p class="uploadArea">请选择文件或拖曳至此上传文件</p>
                    <input type="submit" value="点击上传">
                    <input type="reset" value="点击重置">
                </form>
            </div>
        `,
        render(){
            this.o_el = document.querySelector(this.el)
            document.querySelector(this.el).innerHTML = this.template
        }
    }
    let model = {
        data: {},   //{name: "xx.jpg", url: "http://xx.com/xx.jpg"}
        fetch(){},
        save(data){
            let file = data
            let name = data.name
            let putExtra = {fname: "",params: {},mimeType: [] || null}
            let config = {useCdnDomain: true,region: qiniu.region.z2}
            return axios.get('http://localhost:8888/uptoken').then((response)=>{
                let token  = response.data.token
                return qiniu.upload(file, name, token, putExtra, config)
            })
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render()
            this.bindEvents()
            this.bindEventHub()           
        },
        bindEvents(){
            this.view.o_el.querySelector('input[type=file]').addEventListener('change', (ev)=>{
                eventHub.trigger('uploadBefore')
                let file = ev.currentTarget.files[0] 
                this.model.save(file).then((object)=>{
                    object.subscribe(this.saveCallBack())
                })
            })
        },
        bindEventHub(){},
        saveCallBack(){
            return {
                next: ()=>{
                    eventHub.trigger('uploading') //正在上传
                },
                error: ()=>{
                    console.log('上传出错')
                },
                complete: (response)=>{
                    let name = response.key
                    let url = `http://pfap49o5g.bkt.clouddn.com/${encodeURIComponent(response.key)}`
                    Object.assign(this.model.data, {name: name, url: url})
                    eventHub.trigger('uploadComplete', this.model.data)    // 上传完成
                }
            }
        }
    }

    controller.init(view, model)
}