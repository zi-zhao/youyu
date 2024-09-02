<template>
  <div>
    <div class="cnav">
      <div class="ctext1">评论</div>
      <div>
        <div class="ml-4">
          <span class="cursor-pointer" :class="{ active: activeTab === 'newest' }" @click="handlecommentChange(0)">最新</span>
          <span class="button_gap">|</span>
          <span class="cursor-pointer" :class="{ active: activeTab === 'hottest' }" @click="handlecommentChange(1)">最热</span>
        </div>
      </div>
    </div>
    <div class="commont_body">
      <div class="commentListCont">
        <!-- 一级评论 输入 -->
        <div class="levelOneCommentInput commentInput">
          <div class="input">
            <el-input
                v-model.lazy.trim="levelOneCommentContent"
                :autosize="{ minRows: 1, maxRows: 5 }"
                type="textarea"
                maxlength="200"
                show-word-limit="true"
                resize="none"
                placeholder="发表你的评论吧"
                class="comment-input"
                style="width: 92%;"
            />
            <button @click="handlerlevelOneComment">评论</button>
          </div>
        </div>

        <!-- 评论渲染 -->
        <!-- 评论渲染 -->
        <div class="commentList"  v-infinite-scroll="load" infinite-scroll-distance="100" infinite-scroll-immediate="false">
          <!-- 评论item -->
          <div v-for="record in records" :key="record.id" >
            <div class="levelOneComment commentItem" @mouseenter="record.showMore = true" @mouseleave="record.showMore = false">
              <div class="userPhoto_1">
                <img 
                  v-if="record.newAvatar"
                  :src="record.newAvatar"
                  alt=""
                  class="navbar-avatar"
                  @click="navigateToUserProfile(record.userId)"
                  :style="{ cursor: 'pointer' }"
              >
              </div>
              <!-- 一级评论内容 -->
              <div class="userComment">
                <div style="display: flex;align-items: center;gap: 3px;">
                    <p class="userName">{{ record.username }}</p>
                    <img v-if="record.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                </div>
                <p class="content">{{ record.content }}</p>
                <div class="operationBar">
                  <span class="commentDate">{{ record.createTime }}</span>
                  <div class="operationBar-right">
                    <img
                      class="like-pic"
                      :src=" record.state === 0 ? unlikedImage : likedImage"
                      @click="increaseCount(record)"
                    />
                    <span class="like-count">{{ record.likeCount }}</span>
                    <img class="like-pic" src="@/assets/Comment.svg"  @click="handleSubComment(record.id)"/>
                    <span class="like-count">{{ record.replyCount }}</span>
                    <span class="commentBtn" @click="toggleReplyBox(record.id,record.userId,record.username)"
                      >回复</span
                    >
                    <img src="@/assets/More.svg" class="more" v-if="record.showMore" @click="record.showReported = true" alt="">
                    <div class="hover-box" v-if="record.showReported" @mouseleave="record.showReported = false">
                        <div class="report-hover" @click="commentReport(reply.id,0)">
                          举报
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 一级回复输入框 - 显示在每个一级评论的底下 -->
            <div v-if="activeReplyBoxId === record.id" class="userinput2">
              <div class="input">
                <el-input
                    v-model.lazy.trim="replyCommentContent"
                    :autosize="{ minRows: 1, maxRows: 5 }"
                    type="textarea"
                    maxlength="200"
                    show-word-limit="true"
                    resize="none"
                    placeholder="文本中的评论将被发送"
                    class="comment-input"
                    style="width: 89%;"
                />
                <button @click="handleReplyToFirstLevelComment(record)">
                  评论
                </button>
              </div>
            </div>

            <!-- 二级评论 -->
            <div v-if="record.showComments" >
              <div
                v-for="reply in repliesMap[record.id] || []"
                :key="reply.id"
                class="userComment"
              >
                <div class="leveltwoComment commentItem" @mouseenter="reply.showMore = true" @mouseleave="reply.showMore = false">
                  <div class="userPhoto_2">
                    <img 
                        v-if="reply.newAvatar"
                        :src="reply.newAvatar"
                        alt=""
                        class="navbar-avatar"
                        @click="navigateToUserProfile(reply.userId)"
                        :style="{ cursor: 'pointer' }"
                    >
                  </div>
                  <div class="userComment2">
                    <div style="display: flex;align-items: center;gap: 3px;">
                        <p class="userName2">{{ reply.username }}</p>
                        <img v-if="reply.verified === 1" src="@/assets/VerifiedUser.svg" style="width: 16px;height: 16px;" alt="">
                    </div>
                    <p class="content2">{{ reply.content }}</p>
                    <div class="operationBar2">
                      <span class="commentDate2">{{ reply.createTime }}</span>
                      <!-- 点赞图片 -->
                      <div style="display: flex;align-items: center;">
                        <img
                          class="like-pic2"
                          :src="reply.state === 0 ? unlikedImage : likedImage"
                          @click="increaseCount2(reply)"
                        />
                        <span class="like-count2">{{ reply.likeCount }}</span>
                      </div>
                      <!-- 评论举报 -->
                      <img src="@/assets/More.svg" class="more" v-if=" reply.showMore" @click=" reply.showReported = true" alt="">
                      <div class="hover-box" v-if=" reply.showReported" @mouseleave=" reply.showReported = false">
                        <div class="report-hover" @click="commentReport(reply.id,1)">
                          举报
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bottom" v-if="record.replyCount>0">
                  <el-pagination
                    v-model:current-page="paginationStates[record.id].currentPage"
                    v-model:page-size="paginationStates[record.id].pageSize"
                    :small="small"
                    layout="prev, pager, next"
                    :pager-count="paginationStates[record.id].pageCount"
                    :page-count="paginationStates[record.id].pageCount"
                    @current-change="newPage => handleCurrentChange(record.id, newPage)"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="dialogVisible2">
      <CreportedDialog v-model="dialogVisible2" :id="workId" :type="type"></CreportedDialog>
    </div>
  </div>
</template>

<script setup>
import { ElMessage,ElPagination } from 'element-plus';
import axios from "@/utils/request";
import { ref,onMounted,reactive } from "vue";
import { getUsersAvatarFromCOS } from '@/utils/cosService';
import unlikedImage from '@/assets/LikeBefore.svg';//点赞前图片
import likedImage from '@/assets/LikeAfter.svg';//点赞后图片
import CreportedDialog from '@/page/components/CreportedDialog.vue';
import { useRouter,useRoute} from 'vue-router';
import { formatDateTime} from '@/utils/timeFormat'; 
import { openUrl } from '@/utils/routeJudge'

const dialogVisible2 = ref(false);//控制评论举报弹框是否显示
const type = ref(null);
const commentType = ref(0);
const workId = ref(null);
const currentPage = ref(1);
const router = useRouter();
const route = useRoute();
const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");
const newUserAvater = ref();//存放用户自己的头像
const replyCommentContent = ref("");
const articleData = ref({})//存储文章数据
const records = ref([]); //储存一级评论列表
const repliesMap = ref({}); // 存储每个一级评论ID对应的二级评论列表
const paginationStates = reactive({});//存储每个分页器
const articleId = parseInt(route.params.id,10);//路径中的文章ID
const activeTab = ref('newest');//记录点击最新或最热

const initPaginationState = (recordId) => {
  if (!paginationStates[recordId]) {
    paginationStates[recordId] = {
      currentPage: 1, //分页器中的当前页数
      pageSize: 5, //分页器中的每页呈现数据条数
      pageCount: 0,//分页器中总页数
      pagerCount: 5,//分页器最多显示几个页码
    };
  }
};

const handleCurrentChange = (commentId, currentChange) => {
  if (paginationStates[commentId]) {
    paginationStates[commentId].currentPage= currentChange;
    fetchReplies(commentId, paginationStates[commentId].currentPage, paginationStates[commentId].pageSize);
  }
};

//点击“最新”或“最热”评论
async function handlecommentChange(type) {
  activeTab.value = type === 0 ? 'newest' : 'hottest';
  currentPage.value =1;
  if(type == 0){
    commentType.value = 0;
    await fetchCommentsNew(articleId,currentPage.value);
  }else{
    commentType.value = 1;
    await fetchCommentsHot(articleId,currentPage.value);
  }
}


//向举报弹窗赋值的函数
const commentReport = (id,typeNum) =>{
  workId.value = id;
  type.value = typeNum;
  dialogVisible2.value = true;
}

//点击用户头像进行跳转
const navigateToUserProfile = (user_id) => {
  console.log('点击用户头像跳转');
  if(user_id == userId){
    // const routeLocation = router.resolve({ path: '/PersonalPage' });
    // window.open(routeLocation.href, '_blank');
    openUrl('/PersonalPage')
  }else{
    // const routeLocation = router.resolve({ path: `/OtherUserPersonalPage/${user_id}`});
    // window.open(routeLocation.href, '_blank');
    openUrl(`/OtherUserPersonalPage/${user_id}`)
  }
};


//获取文章内容
async function fetchArticleContent(id) {
  try {
    const response = await axios.get(`/article/${id}`);
    if (response.data && response.data.code === 1) {
      articleData.value =  response.data.data;
      newUserAvater.value = await getUsersAvatarFromCOS(userId);
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error('获取文章数据失败', response.data.msg || 'Unknown error');
      ElMessage.error('获取文章数据失败');
    }
  } catch (error) {
    console.error('网络错误:', error.message);
    ElMessage.error('获取文章数据失败');
  }
}


// 添加一个锁状态
let isLoading = false;
async function load() {
  if (isLoading) return; // 如果已经在加载中，则直接返回不执行新的加载
  isLoading = true; // 开始加载数据，设置锁状态为true
  try {
      if(currentPage.value === 1){
        currentPage.value++;
      }
      if(commentType.value === 0){
        await fetchCommentsNew(articleId,currentPage.value);
      }else if(commentType.value === 1){
        await fetchCommentsHot(articleId,currentPage.value);
      }
      currentPage.value++; // 只有在请求成功完成后才递增页码
  } catch (error) {
      console.error(error);
      ElMessage.error('滚动时的未知错误');
  } finally {
      isLoading = false; // 请求完成，无论成功或失败，都释放锁状态
  }
}

//获取一级评论(最新)
const fetchCommentsNew = async (articleId,currentPage) => {
  if(currentPage === 1){
    records.value = [];
  }
  try {
    const response = await axios.get("/comment/list", {
      params: {
        pageSize: 10,
        currentPage: currentPage,
        articleId: articleId,
        type:0,
        category:1,
      },
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
      response.data.data.records.forEach(record => initPaginationState(record.id));
      const updates = response.data.data.records.map(async (record) => {
        const newAvatar = await getUsersAvatarFromCOS(record.userId);
        return {
          ...record,
          showComments: false,
          showReported: false,
          showMore: false,
          newAvatar // 新获取的头像
        };
      });
      const updatedRecords = await Promise.all(updates);
      records.value = [...records.value, ...updatedRecords];
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
      // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error("获取文章评论失败:",response.data.msg || "Unknown error");
      ElMessage.error('获取文章评论失败');
    }
  } catch (error) {
    console.error("获取文章评论失败", error.message);
    ElMessage.error('获取文章评论失败');
  }
};

//获取一级评论(最热)
const fetchCommentsHot = async (articleId,currentPage) => {
  if(currentPage === 1){
    records.value = [];
  }
  try {
    const response = await axios.get("/comment/list", {
      params: {
        pageSize: 10,
        currentPage: currentPage,
        articleId: articleId,
        type:0,
        category:0,
      },
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
      response.data.data.records.forEach(record => initPaginationState(record.id));
      const updates = response.data.data.records.map(async (record) => {
        const newAvatar = await getUsersAvatarFromCOS(record.userId);
        const verified = await fetchUserInformation(record.userId);
        return {
          ...record,
          verified,
          showComments: false,
          showReported: false,
          showMore: false,
          newAvatar // 新获取的头像
        };
      });
      const updatedRecords = await Promise.all(updates);
      records.value = [...records.value, ...updatedRecords];
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
      // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error("获取文章评论失败:",response.data.msg || "Unknown error");
      ElMessage.error('获取文章评论失败');
    }
  } catch (error) {
    console.error("获取文章评论失败", error.message);
    ElMessage.error('获取文章评论失败');
  }
};

//根据一级评论id获取对应二级评论
const fetchReplies = async (commentId, currentPage, pageSize) => {
  try {
    const response = await axios.get("/comment/reply/list", {
      params: {
        pageSize: pageSize,
        currentPage: currentPage,
        commentId: commentId,
      },
    });
    if (response.data.code === 1 && response.data.data.records.length > 0) {
      repliesMap.value[commentId] = response.data.data.records;
      if (paginationStates[commentId]) {
        paginationStates[commentId].pageCount = Math.ceil(response.data.data.total / pageSize);
      }
      const updates = repliesMap.value[commentId].map(async (record) => {
        const newAvatar = await getUsersAvatarFromCOS(record.userId);
        const verified = await fetchUserInformation(record.userId);
        return {
          ...record,
          verified,
          showReported: false, // 控制评论的举报按钮是否显示
          showMore: false, // 控制评论“more”图标是否显示
          newAvatar,
        };
      });
      repliesMap.value[commentId] = await Promise.all(updates);
    }else if (response.data.code === 1 && response.data.data.records.length === 0) {
      // ElMessage.info('已加载所有数据');
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      console.error( "获取二级评论接口失败:", response.data.msg || "Unknown error" );
      ElMessage.error('获取二级评论接口失败');
    }
  } catch (error) {
    console.error(" 获取二级评论接口失败", error.message);
    ElMessage.error('获取二级评论接口失败');
  }
};

//点击一级评论的评论按钮，展开对应的二级评论
const handleSubComment =(recordId) =>{
  const record = records.value.find(r => r.id === recordId);
  if (record) {
    record.showComments = !record.showComments;
  }
  if (record.showComments) {
    // 初始化分页状态，如果尚未初始化
    initPaginationState(recordId);
    // 使用该一级评论的分页状态来获取二级评论
    fetchReplies(recordId, paginationStates[recordId].currentPage, paginationStates[recordId].pageSize);
  }
}

//最顶部的评论框提交的相关接口
const levelOneCommentContent = ref("");
const handlerlevelOneComment = async () => {
  if (!levelOneCommentContent.value) {
    ElMessage.error("评论内容不能为空!");
    return;
  }
  try {
    const response = await axios.post("/comment/send", {
      authorId:articleData.value.userId,
      authorName:articleData.value.username,
      worksId: articleId,
      worksTitle:articleData.value.title,
      userId: userId,
      username: userName,
      content: levelOneCommentContent.value,
      type:0,
    });
    if (response.data.code === 1) {
      const newReplyId = response.data.map.id;
      ElMessage.success("评论成功!");
      const time = new Date()
      // 假设并构造新的评论
      const newComment = {
        id: newReplyId, // 临时ID，实际应用中这应该是由后台返回的
        newAvatar: newUserAvater.value,
        username: userName, // 假设的用户名，实际上可以从用户会话或其他地方获取
        content: levelOneCommentContent.value,
        createTime: formatDateTime(time), // 使用当前时间作为评论时间
        state:0, // 初始状态下，该评论未被点赞
        likeCount: 0,
        replyCount: 0,
        articleId: articleId, // 假设的文章ID
      };
      // 将新评论添加到records数组的开头
      records.value.unshift(newComment);
      // 清除评论输入框的内容
      levelOneCommentContent.value = "";
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      ElMessage.error("评论失败: " + (response.data.msg || "未知错误"));
    }
  } catch (error) {
    ElMessage.error("提交评论时出现错误: " + error.message);
  }
};

//一级评论框的内容获取
const handleReplyToFirstLevelComment = async (comment) => {
  if (!replyCommentContent.value) {
    ElMessage.error("回复内容不能为空!");
    return;
  }
  try {
    const response = await axios.post("/comment/reply/send", {
      userId: userId, 
      username: userName,
      worksId: articleId,
      worksTitle:articleData.value.title,
      commentId: comment.id,
      content: replyCommentContent.value,
      type:0,
    });
    if (response.data.code === 1) {
      ElMessage.success("回复成功!");
      // 折叠回复框
      activeReplyBoxId.value = null;
      comment.replyCount = response.data.map.replyCount;
      comment.showComments = false;
      replyCommentContent.value = "";
    } else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else {
      ElMessage.error("回复失败: " + (response.data.msg || "未知错误"));
    }
  } catch (error) {
    ElMessage.error("提交回复时出现错误: " + error.message);
  }
};


//一级评论的点赞接口，接受一个 record 作为参数
async function increaseCount(record) {
  try {
      const config = record.state === 0
          ? {
              method: 'put',
              url: `/comment/like`,
              params: { id: record.id , userId : record.userId}
          }
          : {
              method: 'delete',
              url: `/comment/unlike`,
              params: { id: record.id , userId : record.userId}
          };
      const response = await axios(config);
      if (response.data && response.data.code === 1) {
        record.state  = record.state === 0 ? 1 : 0;
        record.likeCount = response .data.data;
        console.log('点赞/取消赞 成功');
      } else if(response.data.code === 0 && response.data.msg){
          ElMessage.error(response.data.msg.toString());
      }else {
        console.error(response.data.msg || 'Unknown error');
        ElMessage.error('点赞失败');
      }
  } catch (error) {
      console.error('获取点赞状态失败', error.message);
      ElMessage.error('点赞动态失败');
  }
}

  //二级评论的点赞接口，接受一个 reply 作为参数
  async function increaseCount2(reply) {
  try {
      const config = reply.state === 0
        ? {
            method: 'put',
            url: `comment/reply/like`,
            params: { id: reply.id , userId : reply.userId}
        }
        : {
            method: 'delete',
            url: `/comment/reply/unlike`,
            params: { id: reply.id , userId : reply.userId}
        };
      const response = await axios(config);
      if (response.data && response.data.code === 1) {
        reply.state  = reply.state === 0 ? 1 : 0;
        reply.likeCount = response.data.data;
      } else if(response.data.code === 0 && response.data.msg){
          ElMessage.error(response.data.msg.toString());
      }else {
        ElMessage.error('点赞操作失败');
        console.error(response.data.msg || 'Unknown error');
      }
  } catch (error) {
      console.error('获取点赞状态失败', error.message);
  }
}

//一级回复框的折叠
const activeReplyBoxId = ref(null);
const toggleReplyBox = (id) => {
  activeReplyBoxId.value = activeReplyBoxId.value === id ? null : id;
};

  // 获取用户信息
const fetchUserInformation = async (userId) => {
  try {
    const response = await axios.get(`/users/${userId}`);
    if(response.data.code === 1){
        return (response.data.data.verified);
    }else if(response.data.code === 0 && response.data.msg){
        ElMessage.error(response.data.msg.toString());
    }else{
        ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    console.error("获取用户信息失败", error);
    ElMessage.error('获取用户信息失败');
  }
};


onMounted(() => {
  fetchArticleContent(articleId);
  fetchCommentsNew(articleId,currentPage.value);
})

</script>

<style scoped>
.bottom{
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0 20px 2rem;
}
::v-deep .el-pagination__rightwrapper .el-pagination__total{
  display: none !important;;
}
.cnav {
  display: flex;
  width: 85%;
  padding: 11px 12px 11px 12px;
  align-items: flex-start;
  gap: 32px;
  flex-shrink: 0;
  margin: 10px auto 20px;
}
.ctext1 {
  font-size: 18px;
}
.ml-4 span {
  display: inline-block;
  text-align: center;
  width: 50px;
  height: 20px;
  font-size: 14px;
}
.ml-4 .button_gap {
  width: 10px;
  height: 20px;
  font-size: 14px;
}

.commont_body {
  width: 85%;
  height: auto;
  margin: 0px auto;
}

.commentListCont {
  margin: 10px auto;
  width: 80%;
  min-width: 650px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 头像 */
.userPhoto_1,
.userPhoto_2 {
  margin-right: 15px;
}
.userPhoto_1 {
  width: 2.5rem;
  height: 2.5rem;
}
.userPhoto_2 {
  width: 2rem;
  height: 2rem;
}
.navbar-avatar {
  border-radius: 50%;
  width: 100%;
  height: 100%;
}
/*一级,二级,评论输入*/
.commentInput {
  width: 106%;
  display: flex;
  align-items: center;
}
.commentInput .input {
  border-radius: 16px;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
} 
.commentInput .input > button {
  border-radius: 20px;
  height: 30px;
  padding: 0 15px;
  border: none;
  box-sizing: border-box;
  background-color: #9fa9ca;
  cursor: pointer;
}
.commentInput .input > button:active {
  box-shadow: 1px 1px 5px 5px #999 inset;
}

/* 评论列表 */
.commentList {
  flex: 1;
  width: 100%;
  padding: 0 5px;
  margin-top: 15px;
}
.levelOneComment {
  display: flex; 
  align-items: flex-start;
  padding: 10px;
  margin-bottom: 2rem;
}
.userComment {
  flex: 1; 
}
.userName {
  color: #393939;
  font-family: Microsoft YaHei;
  margin-top: 2px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.content {
  margin-top: 5px;
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 16px;
  margin: 1rem 0 1.5rem;
  max-width: 100%;
  line-height: 1.6;
}
.operationBar {
  margin-bottom: 3px;
  width: 90%;
  display: flex; 
  justify-content: space-between;
  align-items: center; 
  position: relative;
}
.operationBar-right{
  display: flex;
  width: auto;
  align-items: center;
}
.more{
  cursor: pointer;
  position: absolute;
  right: -100px;
}
.hover-box{
  position: absolute;
  top: 20px ;
  right: -120px;
  width: 50px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px; 
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.report-hover{
  cursor: pointer;
  font-size: 14px;
  color: #5d5d5d;
}
.commentDate {
  color: #9b9b9b;
  font-family: Microsoft YaHei;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-right: 70px;
}
.like-pic {
  height: 16px;
  width: 16px;
  margin-right: 0.2rem;
  cursor: pointer;
}
.like-count {
  display: inline-block;
  width: 45px;
  height: 14px;
  color: #2d2d2d;;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  margin-right: 45px;
}
.commentBtn {
  color: #005b82;
  height: 21px;
  font-family: Microsoft YaHei;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  cursor: pointer; 
}
.userinput2 {
  width: 89%;
  padding: 14px;
  display: flex;
  margin: 25px 0px 25px 63px;
  align-items: center;
}
.userinput2 .input {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.userinput2 .input > button {
  border-radius: 20px;
  height: 30px;
  padding: 0 15px;
  border: none;
  box-sizing: border-box;
  background-color: #9fa9ca;
  cursor: pointer;
}
.userinput2 .input > button:active {
  box-shadow: 1px 1px 5px 5px #999 inset;
}
.leveltwoComment {
  display: flex;  
  align-items: flex-start;  
  margin-bottom: 10px;
  margin-left: 65px;
}
.userComment2 {
  flex: 1; 
}

.userName2 {
  color: #393939;
  font-family: Microsoft YaHei;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.content2 {
  color: #000;
  font-family: Microsoft YaHei;
  font-size: 14px;
  font-style: normal;
  margin: 1rem 0 1.5rem;
  font-weight: 400;
  line-height: normal;
}

.operationBar2 {
  margin-bottom: 3px;
  width: 75%;
  display: flex; 
  justify-content: space-between;
  align-items: center; 
  position: relative;
}
.commentDate2 {
  color: #9b9b9b;
  font-family: Microsoft YaHei;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-right: 70px;
}
.like-count2 {
  display: inline-block;
  width: 45px;
  height: 12px;
  color: #2d2d2d;;
  font-size: 12px;
  font-weight: 700;
  line-height: 12px;
  margin-right: 90px;
}
.like-pic2 {
  width: 16px;
  height: 16px;
  margin-right: 0.2rem;
  cursor: pointer;
}
.commentBtn2 {
  color: #005B82;;
  font-size: 12px;
  font-weight: 400;
  line-height: normal;
  cursor: pointer;  
}
.cursor-pointer {
    cursor: pointer;
}
.cursor-pointer:hover,
.active {
    color: #667bc0;  
}
@media (max-width:768px){
  .cnav{
    width: auto;
  }
  .commont_body{
    width: auto;
    margin-left: 0px;
  }
  .commentListCont{
    width: 95%;
    min-width: auto;
  }
  .commentInput{
    width: 100%;
  }
  .commentInput .input{
    width: auto;
  }
  .commentInput .input>input{
    width: 83%;
    padding: 0 0.5rem;
  }
  .commentInput .input>button,
  .userinput2 .input>button{
    width: 15%;
    padding: 0 3%;
    font-size: 0.8rem;
  }
  .levelOneComment {
    margin-left: 0px;
  }
  .userPhoto_1 ,
  .userPhoto_2 {
    width: 2rem;
    height: 2rem;
    margin-right: 0.5rem;
  }
  .operationBar {
    width: auto;
  }
  .commentDate{
    width: auto;
    margin-right: 0px;
  }
  .like-count,
  .like-count2{
    width: auto;
    margin-right: 8px;
  }
  .leveltwoComment {
    margin-left: 2rem;
  }
  .userinput2{
    width: 93%;
    padding: 0px;
    height: auto;
  }
  .userinput2 .input>input{
    width: 83%;
    padding: 10px 15px;
  }
  .operationBar2 {
    width: 90%;
  }
  .commentDate2,
  .like-count2 {
    width: auto;
    margin-right: 0px;
    margin-left: 0.3rem;
  }
  .commentDate,
  .commentDate2{
    font-size: 0.8rem;
  }
  .content2, 
  .userName2{
    font-size: 1rem;
  }
  .userinput2 .input>button{
    height: 27px;
  }  
  .bottom{
    width: auto;
  }
  .bottom .el-pagination{
    justify-content: center;
  }
}
</style>
