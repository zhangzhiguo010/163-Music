{
    let view = {
        el: '.songLyrics-inner',
        template:`
            <h1>歌词模块</h1>
        `,
        render(){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
        }
    }
    let model = {}
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render()
        }
    }

    controller.init(view, model)
}