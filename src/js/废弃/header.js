{
    let view = new View({
        el: '.header-inner',
        template: `
            <div class="logo">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-wangyiyun"></use>
                </svg>
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-wangyi"></use>
                </svg>
            </div>   
            <div class="welcome">
                <span>欢迎来到网易云音乐后台管理界面</span>
            </div>
            <div class="logInAndOut">
                <a href="#">登录</a>
                <a href="#">注册</a>
            </div>
        `
    })
}
