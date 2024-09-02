import {createStore} from 'vuex'

export default createStore({

   //用在富文本编辑器的注册
  getters: {
    hasRegisteredMenu: state => state.hasRegisteredMenu
  },

  actions: {
    download(context, value) {
      context.commit("DOWNLOAD", value);
    },
     //用在富文本编辑器的注册
    registerMenu({ commit }) {
      commit('registerMenu');
    }
  },
  mutations: {

    //用在富文本编辑器的注册
    registerMenu(state) {
      state.hasRegisteredMenu = true;
    },

/**
 *   下列MULATION都在主页使用
 */

    //获取二级板块id
    GETID(state, value) {
      state.subBoardId = value;
      console.log("id", state.subBoardId);
    },
    // 获取二级板块名称
    GETNAME(state, value) {
      state.subBoardName = value;
      console.log("name", state.subBoardName);
    },
    // 获取文本框内容
    CUSTOM(state, value) {
      state.customValue = value;
      console.log("custom", state.customValue);
    },
    // 获取选中标签内容
    SELECT(state, value) {
      state.selectLabel = value;
    },
    SELECTSTATE(state, value) {
      state.selectState = value;
    },

/**
 *     结束
 */




    DOWNLOAD(state, value) {
      state.show = value;
    },
    REGISTER(state, value) {
      state.register = value;
    },

    SUBMIT(state, value) {
      state.submitDate = value;
      console.log("submit提交数据", state.submitDate);
    },
    SUBMITCOLUMNID(state, value) {
      state.submitColumnId = value;
      console.log("submit提交的专栏ID", state.submitColumnId);
    },

/**
  * 下列MULATION都在个人主页使用
  * 通过改变个人主页的item值，去改变test.value
  */

    GETCOLUMNARTICLETEST(state, value) {
      state.columnArticleTest = value;
      console.log("store中的columnArticleTest", state.columnArticleTest);
    },

    GETCOLUMNSHARETEST(state, value) {
      state.columnShareTest = value;
      console.log("store中的columnShareTest", state.columnShareTest);
    },

    GETFAVORITEARTICLETEST(state, value) {
      state.favoriteArticleTest = value;
      console.log("store中的favoriteArticleTest", state.favoriteArticleTest);
    },

    GETFAVORITESHARETEST(state, value) {
      state.favoriteShareTest = value;
      console.log("store中的favoriteShareTest", state.favoriteShareTest);
    },

/**
 *     结束
 */


/**
  * 下列MULATION都在问答中心使用
  */

    GETPATHUSERID(state, value) {
      state.pathUserId = value;
      console.log("store中的pathUserId", state.pathUserId);
    },


/**
  * 下列MULATION都在其他用户个人主页使用
  */

    GETOTHERUSERID(state, value) {
      state.otherUserId = value;
      console.log("store中的pathUserId", state.otherUserId);
    },


  },

  state: {
    hasRegisteredMenu:false,
    show: false,
    register: false,
    // token:null,
    // userId:null,
    submitDate: {},
    submitColumnId:{},
    subBoardId: null,
    subBoardName: "",
    articleId: null,
    articleAuthorId:null,
    articleTitle:"",
    articleAuthorname:"",
    columnArticleTest: {},
    columnShareTest: {},
    favoriteArticleTest: {},
    favoriteShareTest: {},
    // username:null,
    customValue: "",
    selectLabel: [],
    selectState:null,
    pathUserId:null,
    otherUserId:null,
  },
});




