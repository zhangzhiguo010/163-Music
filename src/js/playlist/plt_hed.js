{
    let view = new View2({
        el: '.menu_details',
        template: `
            <section class="header">
                <div class="hd_bg" style="background-image:url({coverUrl})"></div>
                <div class="hd_content">
                    <div class="hd_lf">
                        <img src="{coverUrl}" alt="">
                        <span class="hd_hint">歌单</span>
                    </div>
                    <div class="hd_rt">
                        <h2 class="menuName">{menuName}</h2>
                        <div class="creator">
                            <svg class="icon" aria-hidden="true">
                                <use xlink:href="#icon-guanliyuan"></use>
                            </svg>
                            <p class="creatorName">{creator}</p>
                        </div>
                    </div>
                </div>
            </section>
            <section class="intro">
                <div class="intro_tags">
                    标签：
                    <span>华语</span>
                    <span>流行</span>
                    <span>古风</span>
                </div>
                <div class="intro_intro">
                    <p>{description}</p>
                </div>
            </section>
        `,
        render(data){
            let newTemplate = this.template
            let placeholder = ['coverUrl','coverUrl','menuName', 'creator', 'description']
            placeholder.map((key)=>{
                if(!data[key]){ data[key] = '' }
                newTemplate = newTemplate.replace(`{${key}}`, data[key])
            })
            this.o_el.innerHTML = newTemplate
        }
    })
    let model = new Model2({
        data: {}
    })
    let controller = new Controller2({
        view: view,
        model: model,
        eventHub: [
            {type: 'uploadMenu', fn: 'listenUploadMenu'}
        ],
        init(){
            this.view.o_el = document.querySelector(this.view.el)
            this.bindEventHub()
        },
        listenUploadMenu(obj){
            this.model.data = obj.menuData
            this.view.render(this.model.data)
        }
    })

    controller.init()
}