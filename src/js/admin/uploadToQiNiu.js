{
    let view = new View({
        el: '.uploadSong-inner',
        data: {
            fileType: '',
            name: '',
            percent: '',
            loaded: '',
            size: ''
        },
        template: `
            <div class="uploadWrapper-background"></div>
            <div class="uploadWrapper">
                <div class="uploadView">
                    <div class="songImgLi">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-musicFile"></use>
                        </svg>
                    </div>
                    <div class="songDetails">
                        <div class="areaHeader">
                            <span>{name}</span>
                        </div>
                        <div class="areaMiddle">
                            <span>{percent}</span>
                            <span>{loaded}{size}</span>
                        </div>
                        <div class="growBar">
                            <div class="growBarInner"></div>
                        </div>
                    </div>
                    <div class="songClose" data-ele="closeBtn">    
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-closeButton"></use>
                        </svg>
                    </div>
                </div>
                <div class="uploadSongArea">
                    <div class="drapArea">
                        <input type="file" data-ele="inputFile">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-cloudStorage"></use>
                        </svg>
                    </div>
                    <p class="hintDrag">拖曳{fileType}文件到此处上传</p>
                    <p class="hintOr">或者</p>
                    <div class="chooseFileButton">
                        <input type="file">
                        选择文件
                    </div>
                </div>
            </div>
        `,
        render(data){
            let newTemplate = this.template
            let placeholder = ['name', 'percent', 'loaded', 'size', 'fileType']
            placeholder.map((item)=>{
                newTemplate = newTemplate.replace(`{${item}}`, data[item])
            })
            this.o_el.innerHTML = newTemplate 

            if(data.percent){
                let percentString = data.percent
                let percentNumber = percentString.slice(0, percentString.length-1) - 0
                this.o_el.querySelector('.growBarInner').style.cssText = `width:${percentNumber}%`
            }
        }
    })

    let model = new Model({
        data: {
            name: '',
            url: ''
        }
    })

    let controller = new Controller({
        view: view,
        model: model,
        events: [
            {ele: 'inputFile', type: 'change', fn:'afterInputFile'},
            {ele: 'closeBtn', type: 'click', fn: 'afterCloseBtn'}
        ],
        eventHub: [
            {type: 'fileUploadToQiNiu', fn: 'afterFileUploadToQiNiu'}
        ],
        init(){
            this.view.render(this.model.data)
        },
        afterInputFile(target){
            let file = target.files[0]
            this.view.data.name = file.name
            this.saveToQiniu_proxy('http://localhost:8888/uptoken', {file: file, name: file.name})
        },
        afterComplete(){
            window.eventHub.trigger('saveToQiNiuComplete', {data: this.model.data, fileType: `${this.view.data.fileType}`})
        },
        afterCloseBtn(){
            this.view.toggleActive2('.uploadSong', 'deactive')
        },
        afterFileUploadToQiNiu(data){
            Object.assign(this.view.data, {fileType: data.fileType})
            this.view.toggleActive2('.uploadSong', 'active')
            this.view.render(this.view.data)
        }
    })

    controller.init()
}