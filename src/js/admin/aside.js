{
    let view = new View({
        el: '.aside-inner ul'
    })
    
    let controller = new Controller({
        view: view,
        events: [
            {ele: 'tab', type: 'click', fn: 'clickTab'}
        ],
        init(){
            this.view.init()
            this.bindEvents()
        },
        clickTab(target){
            let tabName = target.getAttribute('name')
            this.activateLi(target)
            window.eventHub.trigger('selectTab', {tabName: tabName})
        },
        activateLi(target){
            target.classList.add('active')
            let children = target.parentElement.getElementsByClassName('active')
            Array.from(children).forEach((item)=>{
                if(item !== target){
                    item.classList.remove('active')
                }
            })
        }
    })

    controller.init()
}
