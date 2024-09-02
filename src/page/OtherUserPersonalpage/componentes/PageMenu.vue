<template>
  <div class="main">
    <div class="left-section">
      <div class="title">
        <div class="filetitle">
          <img src="@/assets/PersonalPage/ManuscriptManagementleft.svg" alt="" />
          <span class="ptitle">稿件管理</span>
        </div>
      </div>

      <div class="divcontainer">
        <div class="ta">
          <div class="colum_tit">
            <span class="htitle">TA的专栏</span>
            <img src="@/assets/PersonalPage/TaColumnright.svg" alt="" />
          </div>
        </div>
        <div class="spe">
          <div
            class="tapage"       
            @click="handleTapageClick"
            :class="{ active: expandedSections.taArticles }"
          >
            <span class="tatext">TA的文章专栏</span>
          </div>
        </div>
        <div class="spe">
          <div
            class="tapage"
            @click="handleTapageClick2"
            :class="{ active: expandedSections.taShares }"
          >
            <span class="tatext">TA的分享专栏</span>
          </div>
        </div>
        
        <div class="ta" style="margin-top: 5px;">
          <div class="colum_tit">
            <span class="htitle">TA的收藏</span>
            <img src="@/assets/PersonalPage/TaColumnright.svg" alt="" />
          </div>
        </div>

        <div class="spe">
          <div
            class="tapage"
            @click="handleTapageClick3"
            :class="{ active: expandedSections.articles }"
          >
            <span class="tatext">TA的文章收藏</span>
          </div>
        </div>
        <div class="spe">
          <div
            class="tapage"
            @click="handleTapageClick4"
            :class="{ active: expandedSections.shares }"
          >
            <span class="tatext">TA的分享收藏</span>
            <!-- <span class="tatext">10</span> -->
          </div>
        </div>
      </div>
    </div>
    <div class="show">
      <component :is="test"  @dataFromChild="handleChildData" ></component>
    </div>
  </div>
</template>

<script setup>
  import { ref} from "vue";
  import ColumnListA from "../articleColumn/ColumnListA.vue";
  import ArticleListC from "../articleColumn/ArticleListC.vue";
  import ColumnListS from "../shareColumn/ColumnListS.vue";
  import ShareListC from "../shareColumn/ShareListC.vue";
  import FavoriteListA from "../articleFavorite/FavoriteListA.vue";
  import ArticleListF from "../articleFavorite/ArticleListF.vue";
  import FavoriteListS from "../shareFavorite/FavoriteListS.vue";
  import ShareListF from "../shareFavorite/ShareListF.vue";
  //import { ElMessage } from 'element-plus';
  import { useStore } from 'vuex';

  const test = ref(ColumnListA);
  const store = useStore();
  const childIdData = ref();

  const handleChildData = (name,id) => {
    childIdData.value = id;
    if(name === '文章专栏'){setActive(id)}
    if(name === '分享专栏'){setActive2(id)}
    if(name === '文章收藏'){setActive3(id)}
    if(name === '分享收藏'){setActive4(id)}
  }

   function setActive(itemId) {
     if (itemId !== undefined) {
       store.commit('GETCOLUMNARTICLETEST',itemId)
       test.value = ArticleListC;
      
     }
   }

   function setActive2(itemId) {
     if (itemId !== undefined) {
      store.commit('GETCOLUMNSHARETEST',itemId)
      test.value = ShareListC;
     }
   }
  
   function setActive3(itemId) {
     if (itemId !== undefined) {
       store.commit('GETFAVORITEARTICLETEST',itemId)
       test.value = ArticleListF; 
      }
    }

   function setActive4(itemId) {
     if (itemId !== undefined) {
      store.commit('GETFAVORITESHARETEST',itemId)
      test.value = ShareListF; 
     }
   }

  const expandedSections = ref({
    taArticles: true,
    taShares: false,
    articles: false,
    shares: false,
  });



  function toggleExpanded(section) {
    for (const key in expandedSections.value) {
      expandedSections.value[key] = key === section;
    }
  }

  const handleTapageClick = () => {
    toggleExpanded("taArticles"); 
    test.value = ColumnListA;
  };
  const handleTapageClick2 = () => {
    toggleExpanded("taShares");
    test.value =ColumnListS;
  };
  const handleTapageClick3 = () => {
    toggleExpanded("articles"); 
    test.value = FavoriteListA;
  };
  const handleTapageClick4 = () => {
    toggleExpanded("shares"); 
    test.value = FavoriteListS;
  };

  

</script>

<style scoped>
.main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 41px auto 0 auto;
  width: 93%;
}
.left-section {
  display: flex;
  width: 180px;
  flex-direction: column;
}
.title {
  height: 55px;
}
.filetitle {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 4px;
}
.ptitle {
  color: #000;
  text-align: center;
  font-family: Microsoft YaHei;
  font-size: 22px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%; /* 24px */
}
.ta {
  display: flex;
  height: 35px;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  padding-top: 15px;
  border-top: 1px solid rgb(212, 212, 212)
}
.htitle {
  color: #000;
  text-align: center;
  font-family: Microsoft YaHei;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%; /* 21.6px */
}
.colum_tit{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.colum_tit img{
  display: block;
}
.tapage {
  color: #6D757A;
  justify-content: space-between;
  display: flex;
  width: 80%;
  padding: 10px 13px;
  align-items: center;
  border-radius: 4px;
}
.tatext{
  text-align: center;
  font-family: Microsoft YaHei;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%; /* 19.2px */
}
.active {
  background-color: #9fa9ca; /* 根据需要调整高亮样式 */
  color: #000;
}
.divcontainer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.spe {
  overflow-y: auto; /* 这里添加滚动条 */
  overflow-x: hidden; /* 水平方向，隐藏滚轮，确保不出现 */
  transition: height 0.3s ease-in-out; /* 添加过渡效果 */
  cursor: pointer;
  width: 100%;
  margin: 5px 0px;
}
.show {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 80%;
  height: auto;
}
</style>
