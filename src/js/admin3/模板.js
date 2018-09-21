{
    let view = {
        el: '',
        template:`

        `,
        render(){
            this.o_el = document.querySelector(this.el)
            this.o_el.innerHTML = this.template
        }
    }
    let model = {
        data: {}
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render()
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents(){},
        bindEventHub(){}
    }

    controller.init(view, model)
}