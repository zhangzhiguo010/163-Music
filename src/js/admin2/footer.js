{
    let view = {
        el: '.footer-inner',
        template: `
            <h1>尾部怎么这么短？尾部怎么这么短？尾部怎么这么短？尾部怎么这么短？尾部怎么这么短？</h1>
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