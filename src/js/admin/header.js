{
    let view = {
        el: 'header',
        template:`
            <div class="header-inner">
                <div class="logo">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-wangyiyun"></use>
                    </svg>
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-wangyi"></use>
                    </svg>
                </div>   
                <div class="prompt">
                    <span>{title}</span>
                </div>
                <div class="logInAndOut">
                    <a href="#">登录</a>
                    <a href="#">注册</a>
                </div>
            </div>
        `,
        render(data){
            let newTemplate = this.template
            newTemplate = newTemplate.replace('{title}', data.word)
            document.querySelector(this.el).innerHTML = newTemplate
        }
    }
    let model = {
        data: {
            word:'欢迎进入后台管理界面',
            status: 'welcome'
        },
        fetch(){},
        save(){}
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents(){},
        bindEventHub(){
            let time
            eventHub.listen('uploadBefore', ()=>{
                window.clearTimeout(time)
                this.model.data.word = "您正在上传新的歌曲"
                this.view.render(this.model.data)
            })
            eventHub.listen('uploadComplete', ()=>{
                this.model.data.word = "新的歌曲上传成功，请补充其他信息"
                this.view.render(this.model.data)
            })
            eventHub.listen('create', ()=>{
                this.model.data.word = "本歌曲新建完成"
                this.view.render(this.model.data)
            })
            eventHub.listen('select', ()=>{
                window.clearTimeout(time)
                this.model.data.word = "您正在编辑歌曲"
                this.view.render(this.model.data)
            })
            eventHub.listen('change', ()=>{
                this.model.data.word = "歌曲已经成功编辑并保存"
                this.view.render(this.model.data)
                time = setTimeout(()=>{
                    this.model.data.word = "请继续操作"
                    this.view.render(this.model.data)
                }, 3000)
            })
        }
    }

    controller.init(view, model)
}