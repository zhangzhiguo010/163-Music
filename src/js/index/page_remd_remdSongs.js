{
    let view = new View({
        el: 'section.remdSongs',
        template: `
            <h2 class="sectionTitle">推荐歌单</h2>
            <ul>
                <li>
                    <a href="#" class="remd_cover">
                        <div class="remd_imgWrapper">
                            <img src="http://p1.music.126.net/B2RjM_mkyBxeDCS6OlwKyw==/109951163430806499.webp?imageView&thumbnail=246x0&quality=75&tostatic=0&type=webp" alt="" class="remd_img">
                            <div class="remd_praise">
                                <svg class="icon remd_erjiSvg" aria-hidden="true">
                                    <use xlink:href="#icon-erji"></use>
                                </svg>
                                100.5万
                            </div>
                        </div>
                        <p class="remd_text">香港乐坛女子图鉴（1983-2005）</p>
                    </a>
                </li>
                <li>
                    <a href="#" class="remd_cover">
                        <div class="remd_imgWrapper">
                            <img src="http://p1.music.126.net/1XHvQ3RMs2xOpNqBzewHtA==/109951163556989142.webp?imageView&thumbnail=246x0&quality=75&tostatic=0&type=webp" alt="" class="remd_img">
                            <div class="remd_praise">
                                <svg class="icon remd_erjiSvg" aria-hidden="true">
                                    <use xlink:href="#icon-erji"></use>
                                </svg>
                                100.5万
                            </div>
                        </div>
                        <p class="remd_text">人生如旅行，各自修行各自向前</p>
                    </a>
                </li>
                <li>
                    <a href="#" class="remd_cover">
                        <div class="remd_imgWrapper">
                            <img src="http://p1.music.126.net/2LIFpjhtGk0l67uB7ZCQug==/109951163402375543.webp?imageView&thumbnail=246x0&quality=75&tostatic=0&type=webp" alt="" class="remd_img">
                            <div class="remd_praise">
                                <svg class="icon remd_erjiSvg" aria-hidden="true">
                                    <use xlink:href="#icon-erji"></use>
                                </svg>
                                100.5万
                            </div>
                        </div>
                        <p class="remd_text">" 不思进取 思你 "</p>
                    </a>
                </li>
                <li>
                    <a href="#" class="remd_cover">
                        <div class="remd_imgWrapper">
                            <img src="http://p1.music.126.net/DCAbjT2LYTmshb_Eam9Z5w==/109951163558350135.webp?imageView&thumbnail=246x0&quality=75&tostatic=0&type=webp" alt="" class="remd_img">
                            <div class="remd_praise">
                                <svg class="icon remd_erjiSvg" aria-hidden="true">
                                    <use xlink:href="#icon-erji"></use>
                                </svg>
                                100.5万
                            </div>
                        </div>
                        <p class="remd_text">人不如故 工作中听的华语歌单 生活中的BGM</p>
                    </a>
                </li>
                <li>
                    <a href="#" class="remd_cover">
                        <div class="remd_imgWrapper">
                            <img src="http://p1.music.126.net/kzYYqG0uJ8JKz34iBSRdMw==/109951163460068973.webp?imageView&thumbnail=246x0&quality=75&tostatic=0&type=webp" alt="" class="remd_img">
                            <div class="remd_praise">
                                <svg class="icon remd_erjiSvg" aria-hidden="true">
                                    <use xlink:href="#icon-erji"></use>
                                </svg>
                                100.5万
                            </div>
                        </div>
                        <p class="remd_text">提神醒脑 疯狂抖腿魔性摇头.GIF</p>
                    </a>
                </li>
                <li>
                    <a href="#" class="remd_cover">
                        <div class="remd_imgWrapper">
                            <img src="http://p1.music.126.net/EBRqPmY8k8qyVHyF8AyjdQ==/18641120139148117.webp?imageView&thumbnail=246x0&quality=75&tostatic=0&type=webp" alt="" class="remd_img">
                            <div class="remd_praise">
                                <svg class="icon remd_erjiSvg" aria-hidden="true">
                                    <use xlink:href="#icon-erji"></use>
                                </svg>
                                100.5万
                            </div>
                        </div>
                        <p class="remd_text">美国Billboard周榜</p>
                    </a>
                </li>
            </ul>
        `
    })

    let model = new Model({})

    let controller = new Controller({
        view: view,
        model: model,
        init(){
            this.view.init()
        }
    })
    controller.init()
}