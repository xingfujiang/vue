import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import lazyPlugin from 'vue3-lazy'
import loadingDirective from '@/components/base/loading/directive'
import noResultDirective from '@/components/base/no-result/directive'
import { load, saveAll } from '@/assets/js/array-store'
import { FAVORITE_KEY, PLAY_KEY } from '@/assets/js/constant'
import { processSongs } from '@/service/song'

// 引入全局样式文件
import '@/assets/scss/index.scss'

const favoriteSongs = load(FAVORITE_KEY)
if (favoriteSongs.length > 0) {
  processSongs(favoriteSongs).then((songs) => {
    store.commit('setFavoriteList', songs)
    saveAll(songs, FAVORITE_KEY)
  })
}

const historySongs = load(PLAY_KEY)
if (historySongs.length > 0) {
  processSongs(historySongs).then((songs) => {
    store.commit('setPlayHistory', songs)
    saveAll(songs, PLAY_KEY)
  })
}

createApp(App).use(store).use(router).use(lazyPlugin, {
  loading: require('@/assets/images/default.png')
}).directive('loading', loadingDirective).directive('no-result', noResultDirective).mount('#app')


let _Vue = null

export default class VueRouter{
   static install(Vue){
     if(VueRouter.install.installed){
         return
     }

     VueRouter.install.installed = true

     _Vue = Vue

     _Vue.mixin({
        beforeCreate(){
          if(this.$options.router){
            _Vue.prototype.$router = this.$options.router
            this.$options.router.init()
          }
        }
     })
  }

   constructor(options) {
      this.options = options

      this.routeMap = {}

      this.data = _Vue.observable({
         current:'/'
      })
   }

   init(){
     this.createRouteMap()
     this.initComponents(_Vue)
     this.initEvent()
   }

   createRouteMap(){
      this.options.routes.forEach(route=>{
          this.routeMap[route.path] = route.component
      })
   }

   initComponents(Vue){
     Vue.component('router-link',{
        props:{
          to:String
        },
        render(h){
           return h('a',{
             attrs:{
               href:this.to
             },
             on:{
               click: this.clickHandler
             }
           }, [this.$slots.default])
        },
        methods:{
           clickHandler(e){
              history.pushState({},'',this.to)
              this.$router.data.current = this.to
              e.preventDefault()
           }
        }
       // template:'<a :href="to"><slot></slot></a>'
     })

     const  self = this

     Vue.component('router-view', {
        render(h){
         const component = self.routeMap[self.data.current]
           return h(component)
        }
     })
   }

   initEvent(){
      window.addEventListener('popstate',()=>{

        this.data.current = window.location.pathname
      })
   }

}
