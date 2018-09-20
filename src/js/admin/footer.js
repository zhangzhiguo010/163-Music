{
    let view = {
        el: '#upload',
        template:`
            <div class="footer-inner"></div>
        `,
        render(){}
    }
    let model = {
        data: {},
        fetch(){},
        save(){}
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents(){},
        bindEventHub(){}
    }

    controller.init(view, model)
}