{
    function pagination({pageWrapper, dataSource, dataSize, callBack}){
        // console.log(0)
        // 计算应该显示的数据和页码数，通过resolve函数弄出去
        let handleDataSource = {
            pageNumber: 1,
            xx(status, clickPageNumber){
                let maxPageNumber = Math.ceil(dataSource.length/dataSize)
                return new Promise((resolve)=>{
                    switch(status){
                        case 'init':
                            this.pageNumber = 1
                            break
                        case 'previous':
                            if(this.pageNumber === 1){return}
                            this.pageNumber -= 1
                            break
                        case 'next':
                            if(this.pageNumber === maxPageNumber){return}
                            this.pageNumber += 1
                            break
                        case 'skip':
                            if(this.pageNumber === clickPageNumber){return}
                            this.pageNumber = clickPageNumber
                            break
                    }
                    let newData = dataSource.slice(dataSize*(this.pageNumber-1), dataSize*this.pageNumber)
                    // console.log(1)
                    resolve({newData, maxPageNumber})
                })
            }
        }
        // 渲染页面，生成html标签
        let o_pageWrapper = document.querySelector(pageWrapper)
        o_pageWrapper.innerHTML = `
            <input type="button" value="上一页" class="previousPage">
            <ol></ol>
            <input type="button" value="下一页" class="nextPage">
        `
        // 为按钮绑定事件，进行正确跳转
        innerCallBack.call(this, 'init')
        o_pageWrapper.querySelector('input[class=previousPage]').addEventListener('click', innerCallBack.bind(this, 'previous'))
        o_pageWrapper.querySelector('input[class=nextPage]').addEventListener('click', innerCallBack.bind(this, 'next'))
        o_pageWrapper.querySelector('ol').addEventListener('click', (ev)=>{ innerCallBack.call(this, 'skip', ev.target.innerText-0) })

        function innerCallBack(status, pageNumber){
            return handleDataSource.xx(status, pageNumber).then((obj)=>{
                let {newData, maxPageNumber} = obj
                // 判断是否是初始化，是的话就生成页码
                if(status === 'init'){
                    for(let i=1; i<=maxPageNumber; i++){
                        let li = document.createElement('li')
                        li.innerText = i
                        li.classList.add('skip')
                        o_pageWrapper.querySelector('ol').appendChild(li)
                    }
                }
                // console.log(2)
                callBack.call(this, newData, maxPageNumber)
            })
        }
    }
}