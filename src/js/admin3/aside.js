{
    let view = {
        el: '.aside-inner',
        template:`
            <ul>
                <li name="tab_songList">歌曲列表</li>
                <li name="tab_newAndEdit">新建/编辑歌曲</li>
            </ul>
        `,
        render(){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
        }
    }
    let model = {
        data: {
            select: ''
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
            this.view.o_el.addEventListener('click', (ev)=>{
                if(ev.target.nodeName.toLowerCase() === 'li'){
                    let tabName = ev.target.getAttribute('name')
                    window.eventHub.trigger('selectTab', {tabName: tabName})
                }
            })
        },
        bindEventHub(){}
    }

    controller.init(view, model)
}