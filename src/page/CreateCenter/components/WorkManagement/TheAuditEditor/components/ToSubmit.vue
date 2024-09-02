<template>
    <div class="large_submit2">
        <!-- 每一行使用一个div进行包裹 -->    
        <div class="row">
            <label for="classify">文章分类<span class="nes-star">*</span></label>
            <!-- 显示被选中的二级板块 -->
            <el-popover
                placement="bottom" title="分类" :width="300" trigger="click" v-model:visible=visible>
                <div>
                    <el-tabs :tab-position="tabPosition" style="height: 200px" class="demo-tabs" @tab-click="handleTabClick">
                            <el-tab-pane :label="source.name" v-for="(source,index) in board" :key="index" :name="index">
                                <div class="contain">
                                    <!-- 遍历生成二级板块 -->
                                    <div class="small" v-for="(context,subIndex) in subBoard" :key="subIndex"  :name="context.name">
                                        <span @click="selectLabels(subIndex)" >{{ context.name }}</span>
                                    </div>
                                </div>
                            </el-tab-pane>
                    </el-tabs>
                </div>
                <template #reference >
                    <el-button class="m-2">
                        <span v-if="popboxess">选择文章分类<span class="nes-star">*</span></span>
                        <span v-else>{{ subBoardName }}</span>
                    </el-button>
                </template>

            </el-popover>
        </div>

        <div class="row">
            <div class="label_top" style="display: flex;">
                <label for="label">文章标签<span class="nes-star">*</span></label>
                <div  class="label-container" >
                    <span v-for="(context,index) in labelSelected" :key="index" class="tag-btn">
                        {{ context }}
                        <i @click="deLabel(index)">×</i>
                    </span>
                </div>
            </div>
            <div class="labelThree"  v-show="showLabels">
                <label for="label" style="font-size: 14px; margin-left: 70px;">推荐标签：</label>
                <div class="tag-btn" v-for="(context,index) in label" :key="index"  >        
                    <span  @click="selectOneLable(index)">
                        {{ context.name }}
                    </span>
                 </div>
            </div>
            <div class="labelThree" v-show="showLabels">
                <label for="label" style="font-size: 14px; margin-left: 70px;">新建标签：</label>
                <input 
                    type="text" 
                    placeholder="输入后回车可自己创建标签~" 
                    v-model="newTag" 
                    @keyup.enter="addNewTag"
                    class="custom-input-size"
                />
            </div>
        </div>

        <!-- 文章简介 -->
        <div class="introduction row">
            <label for="introduce" style="white-space: nowrap;">文章简介<span class="nes-star">*</span></label>
            <el-input
                v-model="textarea"
                :rows="3"
                type="textarea"
                maxlength="100"
                show-word-limit="true"
                resize="none"
                placeholder="文章简介：将在推送中展现，帮助读者快速了解内容，可将正文前100字填入简介框"
                class="eidt-input"
            />
        </div>
        <div class="box1">
            <span class="tclass">文章类型<span class="nes-star">*</span></span>
            <div class="my-2 flex items-center text-sm">
              <el-radio-group v-model="articleType" class="radio_share">
                <el-radio label=0>原创</el-radio>
                <el-radio label=1>转载</el-radio>
                <el-radio label=2>翻译</el-radio>
              </el-radio-group>
            </div>
        </div>
            
        <div class="box1" v-show="articleType === '1' || articleType ==='2'">
            <span class="tclass">原文链接<span class="nes-star">*</span></span>
            <el-input style="width: 80%;" v-model="originalArticle" placeholder="填写链接" type="text" class="input_el"/>  
        </div>
        
        <div class="box1">
            <span class="tclass">权限设置<span class="nes-star">*</span></span>
            <div class="my-2 flex items-center text-sm">
              <el-radio-group v-model="access" class="radio_share">
                <el-radio label=0>公开<span class="ptext">(所有人公开)</span></el-radio>
                <el-radio label=1>私密<span class="ptext">(仅自己可见)</span></el-radio>
              </el-radio-group>
            </div>
          </div>

        <div class="box1">
            <span class="tclass">文章收费<span class="nes-star">*</span></span>
            <div class="my-2 flex items-center text-sm">
              <el-radio-group v-model="charge" class="radio_share">
                <el-radio label=0>免费</el-radio>
                <el-radio label=1>收费</el-radio>
              </el-radio-group>
            </div>
        </div>

        <div class="box1" v-show="charge === '1' ">
            <span class="tclass">支付方式<span class="nes-star">*</span></span>
            <div class="my-2 flex items-center text-sm">
              <el-radio-group v-model="cost" class="radio_share">
                <el-radio label=0>鱼饵</el-radio>
                <el-radio label=1>渔币</el-radio>
              </el-radio-group>
            </div>
            <div class="moneyInput" v-show="cost === '0'">
                <span>需支付</span>
                <el-input type="text" v-model="moneyOne" placeholder="请填写支付数量"></el-input>
                <span>个鱼饵</span>
            </div>
            <div class="moneyInput" v-show="cost === '1'">
                <span>需支付</span>
                <el-input type="text" v-model="moneyTwo" placeholder="请填写支付数量"></el-input>
                <span>个渔币</span>
            </div>
        </div>

        <div class="last row">
            <span>请确认上述信息无误,在发表文章前一定要点击“确认”保存数据！</span>
            <button class="btn" @click="submit">确认</button>
        </div>
    </div>
</template>

<script setup>
import { reactive,ref,onMounted,computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute} from 'vue-router';
import axios from '@/utils/request'
import CfDialog from '@/page/components/CfDialog';
import { ElMessage } from 'element-plus';

const store = useStore();
const route = useRoute();
const articleId = parseInt(route.params.id,10);//路径中的文章ID
const article = ref({});
const board = reactive([]);
const subBoard = reactive([]);

const boardId =  computed(() => article.value.boardId);
const boardName =  computed(() => article.value.boardName);
const subBoardId =  computed(() => article.value.subBoardId);
const subBoardName =  computed(() => article.value.subBoardName);
const label = reactive([]);
const access =  computed(() => article.value.access);//文章可见范围
const textarea =  computed(() => article.value.textarea); //存放文本框（文章简介）中的内容
const articleType = ref();//文章类型
const originalArticle = ref("http://154.8.172.164/")//原文所在URL
const charge =ref('');//文章免费或收费
const cost = ref('');//支付方式：鱼饵或渔币
const moneyOne = ref(0);//鱼饵
const moneyTwo = ref(0);//渔币
const requiredPoint1 = computed(() => {
    return moneyOne.value;
});
const requiredCoin1 = computed(() => {
    return moneyTwo.value;
});
const newOriginalArticle = computed(() => {
    return originalArticle.value;
});

const visible = ref(false);
const tabPosition = ref('left'); // 设置弹出框分布
let showSubBoardSelected = ref(false); // 设置选择的二级板块是否显示
let showLabels = ref(false);  // 设置标签是否显示
let labelSelected = reactive([]);  // 放置选中的三级标签
const popboxess = ref(true);
const dialogFormVisible = ref(false);//控制cfdialog弹窗（显示文章专栏列表）是否弹出
const popboxes =ref(true);//控制文章分类专栏这个按键的显示值


//获取一级板块信息
const fetchBoardData = async () => {
    try {
        //    const response = await axios.get('/board?apifoxApiId=102350996');
        const response = await axios.get('/board');
        for (let i = 0; i < response.data.data.length; i++) {
        board.push({
            id: response.data.data[i].id,
            name: response.data.data[i].name,
        });
        }
    } catch (error) {
        console.error("无法获取一级板块：", error);
    }
};


//点击一级板块后获取对应的二级板块
function handleTabClick(tab) {
    subBoard.length = 0
    boardId.value = board[tab.props.name].id
    boardName.value = board[tab.props.name].name
    //   axios.get(`/subboard/${boardId.value}?apifoxApiId=102356783`)
    axios.get(`/subboard/${boardId.value}`)
    .then((response)=>{
        for(let i =0;i<response.data.data.length;i++){
            subBoard.push({id:response.data.data[i].id,name:response.data.data[i].name})
        }
    })
    .catch((error)=>{
        console.log(error);
    })
}

//点击二级板块后获取二级板块对应的文章标签
function selectLabels(tab) {
    label.length = 0
    subBoardId.value = subBoard[tab].id
    subBoardName.value = subBoard[tab].name
    showSubBoardSelected.value = true
//   axios.get(`/articlelabel/${subBoardId.value}?apifoxApiId=102383582`)
    axios.get(`/articlelabel/${subBoardId.value}`)
    .then((response)=>{
            for(let i =0;i<response.data.data.length;i++){
            label.push({id:response.data.data[i].id,name:response.data.data[i].name})
        }
        popboxess.value = false;
    })
    .catch((error)=>{
        console.log(error);
    })
    showLabels.value = true
}

// 存储选中的标签
function selectOneLable(index){
    labelSelected.push(label[index].name)
}

// 删除已选中的标签
function deLabel(i){
    const index = labelSelected.indexOf(labelSelected[i]);
    if (index !== -1) {
        labelSelected.splice(index, 1);
    }
}

//自定义新增标签
const newTag = ref(''); // 用于绑定到输入框的新标签名
const addNewTag = () => {
    if (labelSelected.length >= 4) {
        alert("最多只能添加4个标签");
        return;
    }

    if (newTag.value && !labelSelected.includes(newTag.value)) {
        labelSelected.push(newTag.value);
        addLabelToMysql(newTag.value);
        newTag.value = '';  // 清空输入框
    }
};


//添加标签接口
async function addLabelToMysql(name) {
    try {
        const response = await axios.post('/articlelabel',{
            name:name,
            subBoardId:Number(subBoardId.value),
            subBoardName:subBoardName.value,
        });
        if (response.data.code === 1) {
        // ElMessage.success('添加标签成功')
        }else if(response.data.code === 0 && response.data.msg){
            ElMessage.error(response.data.msg.toString());
        }else{
            console.error("添加标签失败");
            ElMessage.error("添加标签失败");
        }
    } catch (error) {
        console.error('添加标签失败', error);
        ElMessage.error("添加标签失败");
    }
}

//将用户提交的文章属性数据放入submitdata统一保存
let submitDate = reactive({
    get requiredPoint() { return parseInt(requiredPoint1.value); }, // 鱼饵数
    get requiredCoin() { return parseInt(requiredCoin1.value); },  // 渔币数
    get type() { return  parseInt(articleType.value); }, // 文章类型，0：原创，1：转载，2：翻译。
    get summary() { return textarea.value; },//文章简介
    get label() { return labelSelected.join(','); },//文章标签
    get access() { return  parseInt(access.value); }, // 可见性，0为公共可见，1为仅自己可见，默认0
    get boardId() { return boardId.value; },//一级板块Id
    get boardName() { return boardName.value; },//一级板块名称
    get subBoardId() { return subBoardId.value; },//二级板块Id
    get subBoardName() { return subBoardName.value; },//二级板块名称
    get originalArticle() {return newOriginalArticle.value;},//原文所在URL
})

//将submitdata中的数据存入store
const submit = ()=>{
    store.commit('SUBMIT',submitDate)
}

//获取文章内容
async function fetchArticleContent(id) {
  try {
    const response = await axios.get(`/article/${id}`);
    if ( response.data.code === 1) {
      article.value = response.data.data;
      articleType.value =  String(article.value.type);
      if(article.value.requiredPoint === 0 && article.value.requiredCoin === 0){
        charge.value = '0';
        moneyOne.value = 0;
        moneyTwo.value = 0;
      }else if(article.value.requiredPoint !=0){
        charge.value = '1';
        cost.value = '0';
        moneyOne.value = article.value.requiredPoint;
        moneyTwo.value = 0;
      }else if(article.value.requiredCoin !=0){
        charge.value = '1';
        cost.value = '1';
        moneyTwo.value = article.value.requiredCoin;
        moneyOne.value = 0;
      }
     if(article.value.type != 0){
        originalArticle.value = article.value.originalArticle; 
      }
    } else if(response.data.code === 0 && response.data.msg){
      ElMessage.error(response.data.msg.toString());
    }else {
      console.error('无法找到匹配文章数据', response.data.msg || 'Unknown error');
      ElMessage.error('无法找到匹配文章数据');
    }
  } catch (error) {
    console.error('无法获取接口数据', error.message);
    ElMessage.error('无法找到匹配文章数据');
  }
}

onMounted(async () => {
  await fetchBoardData();
  await fetchArticleContent(articleId);
});

</script>

<style scoped>
::v-deep .el-dialog__body{
    padding-top: 0px;
    padding-bottom: 0px;
}
.large_submit2{
    border-radius: 0px 0px 4px 4px;
    background: #fff;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    width: 1020px;
    padding: 20px 40px 24px;;
    display: flex;
    flex-direction: column;
    margin: 0px auto;
    gap:35px
}
label{
    color: #606266;
    font-family: Microsoft YaHei;
    font-size: 16px;
    margin-right: 80px;
    cursor: pointer;
    position: relative;
}
input{
    cursor: pointer;
}
select{
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    cursor: pointer;
}
option{
    color: #545454;
    font-family: Microsoft YaHei;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}
#classify{
    cursor: pointer;
}
.nes-star{
    color: #de0000;
    position: absolute;
    left: -15px;
    top: 2px;
    font-size: 20px;
}
/* 标签输入框 */
.custom-input-size {
    width: 170px; 
    height: 17px;
    padding: 6px 10px;
    border-radius: 5px;
    border: none;
    margin-left: -6px;
}
 input.custom-input-size:focus {
  outline: none;
  box-shadow: 0 2px 6px #cfd7e2;
  border: 1px solid #d7d7d7;
}
.custom-input-size{
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #efefef;
}
.introduction{
    display: flex;
    align-items: flex-start;
}
.tclass{
    margin-right: 80px;
    color: #606266;
    position: relative;
}
img {
  max-width: 100%;
  max-height: 100%;
}
.textarea-container{
    position: relative;
    display: inline-block;
}
textarea{
    width: 688px;
    height: 68px;
    resize: none;
    box-sizing: border-box;
    padding-bottom: 20px;
}
.contain{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}
.small{
    align-items: center;
    margin: 2px 0px 10px 10px;
    padding: 5px;
    cursor: pointer;
}
a{
    text-decoration: none;
    color: black;
}
i{
    border-radius: 50%; 
    text-align: center;
    position: relative; 
    cursor: pointer; 
    font-size: 12px; 
    height: 16px; 
    width: 16px; 
    line-height: 16px; 
    vertical-align: middle; 
    top: -1px;
    right: -5px;
}
.label-container{
    border: 1px solid #DCDFE6;
    display: inline-block;
    width: 800px;
    min-height: 40px;
    height: auto;
    padding: 5px;
    margin-bottom: 10px;
    border-radius: 5px;
}
.labelThree{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    height: 28px;
    margin-left: 50px;
    margin-top: 15px;
}
.labelThree label{
    margin-right: 10px;
}
.moneyInput{
    margin-left: 94px;
}
.moneyInput span{
    font-size: 14px;
}
.moneyInput .el-input{
    width: 60px;
    margin: 0px 5px;
}
.el-input__inner{
    text-align: center;
}
.last{
    margin: 0 auto 2rem;
}
.last span{
    color: #3284CF;
    font-size: 12px;
}
.btn{
  width: 80px;
  height: 32px;
  margin-left: 20px;
  border-radius: 16px;
  border: 1px solid #DCDFE6;
  background-color: #9FA9CA;
  cursor: pointer;
}

.box1{
  display: flex;
  width: 780px;
  height: 24px;
  align-items: center;
}
/* 紫色标签样式 */
.tag-btn {
  display: inline-block;
  color: #000;
  height: 25px;
  line-height: 25px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #DCDFE6;
  border-radius: 10px;
  background: #9FA9CA;
  padding: 2px 10px;
  margin: 5px;
}
.tag-btn:hover {
    background: #CCD3E8; 
}
::v-deep .el-radio__label{
    width: 100px;
}
</style>