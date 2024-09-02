import router from '../router'

class MyButtonMenu{
 title =  "切换到markdown"
 // iconSvg = QUOTE_SVG
 tag = 'button'

 getValue() {
    // 用不到 getValue
    return ''
  }

  isActive() {
    return false
  }

  isDisabled(){
    return false
  }

  exec() {
    router.push('/MarkDown');
  }
}


export const myButtonMenu={
 key: 'create', // menu key ，唯一。注册之后，可配置到工具栏
  factory() {
    return new MyButtonMenu()
  }
}

