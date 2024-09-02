import { createRouter,createWebHashHistory } from "vue-router";
// import store from "@/store"; 
import store from "@/store"; 
import TheMain from  '@/page/TheMain/TheMain.vue'
import TheFirst from '@/page/TheFirst/TheFirst.vue'
import MarkDown from '@/page/TheEditor/MarkDown.vue'
import WangEditor from '@/page/TheEditor/WangEditor.vue'
// import NewsPage from "@/page/NewsCenter/components/NewsPage.vue";
import TheArticle from "@/page/TheArticle/TheArticle.vue";
import ShareEditor from "@/page/ShareEditor/ShareEditor.vue";
import ShareShow from "@/page/ShareShow/ShareShow.vue";
import MessageCenter from '@/page/MessageCenter/MessageCenter.vue'
import MyFocus from "@/page/MessageCenter/component/MyFocus/MyFocus.vue";
// import MyMessage from '@/page/MessageCenter/component/MyMessage.vue'
import MyView from '@/page/MessageCenter/component/CommentMessage/MyView.vue'
import SystemNote from '@/page/MessageCenter/component/SystemMessage/SystemNote.vue'
import CreateAritle from '@/page/MessageCenter/component/CreateMessage/CreateAritle.vue'
import FocusMe from '@/page/MessageCenter/component/FocusMe/FocusMe.vue'
import LikeNotice from '@/page/MessageCenter/component/LikeMessage/LikeNotice.vue'
import CreateCenter from '@/page/CreateCenter/CreateCenter.vue'
import HistoryRecord from '@/page/HistoryRecord/HistoryRecord.vue'
import CustomerService from '@/page/CustomerService/CustomerService.vue'
import TheSettings from "@/page/TheSettings/TheSettings.vue";
import DefaultPresentation from "@/page/QACenter/DefaultPresentation.vue"
import AnswererBrief from "@/page/QACenter/AnswererBrief/AnswererBrief.vue";
import LMyQuestioned from "@/page/QACenter/components/CompletedList/LMyQuestioned.vue";
import LQuestionedMe from "@/page/QACenter/components/CompletedList/LQuestionedMe.vue";
import LiveChat from "@/page/QACenter/components/OngoingConversation/LiveChat.vue";
import GoQuestion from "@/page/components/GoQuestion.vue";
import GoAnswer from '@/page/components/GoAnswer.vue'
import UserPortrait from '@/page/UserPortrait/UserPortrait.vue'
import ReMarkDown from "@/page/CreateCenter/components/WorkManagement/TheEditor/MarkDown.vue";
import ReWangEditor from "@/page/CreateCenter/components/WorkManagement/TheEditor/WangEditor.vue";
import ReAudittedMarkDown from "@/page/CreateCenter/components/WorkManagement/TheAuditEditor/MarkDown.vue";
import ReAudittedWangEditor from "@/page/CreateCenter/components/WorkManagement/TheAuditEditor/WangEditor.vue";
import ErrorPage from "@/page/ErrorPage/ErrorPage.vue";
// import NewsCenter from "@/page/NewsCenter/NewsCenter.vue"
import VideoText from "@/page/VideoText/VideoText.vue"

import { ElMessage } from 'element-plus';
import { styleType } from "element-plus/es/components/table-v2/src/common";

const routes = [
  {
    path: "/",
    component: TheFirst,
    meta: {
      title: "首页 - 云联知渔",
      openInNewTab: false,
    },
  },
  {
    path: "/CommunityNorm",
    component: () => import("../page/TheFirst/CommunityNorm.vue"),
    meta: {
      title: "社区规范 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/CurrencyAgreement",
    component: () => import("../page/TheFirst/CurrencyAgreement.vue"),
    meta: {
      title: "货币协议 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/UserAgreement",
    component: () => import("../page/TheFirst/UserAgreement.vue"),
    meta: {
      title: "用户协议 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/GMHgcVCgc8KI2cffBqMcbTfrdH7fymxa26e7e4bfb4179d23ad41c90a10191d41wcJelmwSgLKYICMLk7eGxSsJVFc5x8Xn48Zabr909",
    component: VideoText,
    meta: {
      title: "视频测试 - 云联知渔",
      openInNewTab: false,
    },
  },
  {
    path: "/TheMain",
    component: TheMain,
    meta: {
      title: "主页 - 云联知渔",
      openInNewTab: false,
    },
  },
  {
    path: "/TheSettings",
    component: TheSettings,
    meta: {
      title: "个人设置 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/VerificationApplication",
    component: () => import("@/page/TheSettings/components/VerificationApplication.vue"),
    meta: {
      title: "认证用户申请 - 云联知渔",
      openInNewTab: true,
    },
  },
  // {
  //   path: "/NewsPage/:id",
  //   component: NewsPage,
  //   meta: {
  //     openInNewTab: false,
  //   },
  // },
  // {
  //   path: "/NewsCenter",
  //   component: NewsCenter,
  //   meta: {
  //     title: "新闻 - 云联知渔",
  //     openInNewTab: true,
  //   },
  // },
  {
    path: "/ShareShow",
    component: ShareShow,
    meta: {
      title: "分享 - 云联知渔",
      openInNewTab: false,
    },
  },
  {
    path: "/DefaultPresentation",
    component: DefaultPresentation,
    name: "DefaultPresentation",
    meta: {
      title: "问答中心 - 云联知渔",
      openInNewTab: false,
    },
  },
  // 答主简介
  {
    path: "/DefaultPresentation/AnswererBrief/:id",
    component: AnswererBrief,
    name: "AnswererBrief",
    meta: {
      openInNewTab: true,
    },
  },
  //我向别人的提问  已完成
  {
    path: "/CompletedList/LMyQuestioned/:questionId/:userId",
    component: LMyQuestioned,
    name: "LMyQuestioned",
    meta: {
      title: "问答中心 - 云联知渔",
      openInNewTab: true,
    },
  },
  //别人向我的提问  已完成
  {
    path: "/CompletedList/LQuestionedMe/:questionId/:userId",
    component: LQuestionedMe,
    name: "LQuestionedMe",
    meta: {
      title: "问答中心 - 云联知渔",
      openInNewTab: true,
    },
  },
  //用户进行提问的界面
  {
    path: "/GoQuestion/:id",
    name: "GoQuestion",
    component: GoQuestion,
    meta: {
      title: "提问 - 云联知渔",
      openInNewTab: true,
    },
  },
  //答主第一次回答的界面
  {
    path: "/GoAnswer/:questionId/:askerId",
    name: "GoAnswer",
    component: GoAnswer,
    meta: {
      title: "咨询 - 云联知渔",
      openInNewTab: true,
    },
  },
  //实时聊天室
  {
    path: "/OngoingConversation/LiveChat/ask/:id/:questionId/:number",
    component: LiveChat,
    name: "LiveChat1",
    meta: {
      title: "咨询 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/OngoingConversation/LiveChat/answer/:id/:questionId/:number",
    component: LiveChat,
    name: "LiveChat2",
    meta: {
      title: "咨询 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/ShareEditor",
    component: ShareEditor,
    meta: {
      title: "分享编辑 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/404",
    component: ErrorPage,
    meta: {
      title: "未找到资源",
      openInNewTab: false,
    },
  },
  {
    path: "/HistoryRecord",
    component: HistoryRecord,
    meta: {
      title: "历史记录 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/MarkDown",
    component: MarkDown,
    meta: {
      title: "文章编辑 - 云联知渔",
      openInNewTab: false,
    },
  },
  {
    path: "/WangEditor",
    component: WangEditor,
    meta: {
      title: "文章编辑 - 云联知渔",
      openInNewTab: false,
    },
  },
  {
    path: "/TheArticle/:id",
    component: TheArticle,
    meta: {
      openInNewTab: true,
    },
  },
  {
    path: "/CreateCenter",
    component: CreateCenter,
    meta: {
      title: "创作中心 - 云联知渔",
      openInNewTab: false,
    },
  },
  {
    path: "/WangEditor/:id",
    component: ReWangEditor,
    meta: {
      title: "文章编辑 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/MarkDown/:id",
    component: ReMarkDown,
    meta: {
      title: "文章编辑 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/WangEditor/auditted/:id",
    component: ReAudittedWangEditor,
    meta: {
      title: "文章编辑 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/MarkDown/auditted/:id",
    component: ReAudittedMarkDown,
    meta: {
      title: "文章编辑 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/CustomerService",
    component: CustomerService,
    meta: {
      title: "网站反馈 - 云联知渔",
      openInNewTab: true,
    },
  },
  {
    path: "/UserPortrait",
    component: UserPortrait,
    meta: {
      title: "欢迎来到有渔！",
      openInNewTab: false,
    },
  },
  {
    path: "/MessageCenter",
    component: MessageCenter,
    name: "MessageCenter",
    redirect: { name: "SystemNote" },
    meta: {
      title: "消息中心 - 云联知渔",
      openInNewTab: true,
    },
    children: [
      {
        path: "CreateAritle",
        name: "CreateAritle",
        component: CreateAritle,
        meta: {
          openInNewTab: false,
        },
      },
      {
        path: "MyFocus",
        name: "MyFocus",
        component: MyFocus,
        meta: {
          openInNewTab: false,
        },
      },
      {
        path: "FocusMe",
        name: "FocusMe",
        component: FocusMe,
        meta: {
          openInNewTab: false,
        },
      },
      // {
      //   path: "MyMessage",
      //   name: "MyMessage",
      //   component: MyMessage,
      // },
      {
        path: "MyView",
        name: "MyView",
        component: MyView,
        meta: {
          openInNewTab: false,
        },
      },
      {
        path: "SystemNote",
        name: "SystemNote",
        component: SystemNote,
        meta: {
          openInNewTab: false,
        },
      },
      {
        path: "LikeNotice",
        name: "LikeNotice",
        component: LikeNotice,
        meta: {
          openInNewTab: false,
        },
      },
    ],
  },
  {
    path: "/PersonalPage",
    component: () => import("../page/Personalpage/PersonalPage.vue"),
    meta: {
      openInNewTab: true,
    },
    children: [
      // 个人中心
      {
        path: "",
        name: "persondetail",
        component: () => import("../page/Personalpage/PersonDetail.vue"),
        meta: {
          openInNewTab: false,
        },
      },
      // 我的粉丝
      {
        path: "helover",
        name: "helover",
        component: () => import("../page/Personalpage/componentes/HeLove.vue"),
        meta: {
          openInNewTab: false,
        },
      },
    ],
  },
  {
    path: "/OtherUserPersonalPage",
    component: () => import("../page/OtherUserPersonalpage/PersonalPage.vue"),
    meta: {
      openInNewTab: true,
    },
    children: [
      // 个人中心
      {
        path: ":id",
        name: "persondetail2",
        component: () =>
          import("../page/OtherUserPersonalpage/PersonDetail.vue"),
        meta: {
          openInNewTab: false,
        },
      },
      // 我的粉丝
      {
        path: "helover/:id",
        name: "helover2",
        component: () =>
          import("../page/OtherUserPersonalpage/componentes/HeLove.vue"),
        meta: {
          openInNewTab: false,
        },
      },
    ],
  },
  {
    path: "/VideoMain",
    component: () => import("@/page/TheVideo/VideoMain.vue"),
    meta: {
      title: "视频课程 - 云联知渔",
      openInNewTab: false,
    },
  },
  {
    path: "/CourseDetail/:id",
    component: () => import("@/page/TheVideo/CourseDetail.vue"),
    meta: {
      openInNewTab: false,
    },
  },
  {
    path: "/PurchasedCourse",
    component: () => import("@/page/TheVideo/PurchasedCourse.vue"),
    meta: {
      openInNewTab: false,
    },
  },
];


  const router = createRouter({
    history:createWebHashHistory(),
    routes
  })

  //导航守卫
  router.beforeEach((to, from, next) => {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      next();
      return;
    }
    const token = localStorage.getItem("token");

    if (token) {
      if (to.path === "/NewsList" && to.query.noRedirect) {
        // 当有token并且访问的是NewsList，但带有noRedirect参数时，直接让其进入，不再重定向
        next();
      } else {
        next();
      }
    } else {
      const allowedPaths = [
        "/",
        "/NewsList",
      ];
      if (allowedPaths.includes(to.path)) {
        if (to.path === "/NewsList" && !to.query.noRedirect) {
          next(); // 直接进入，不再重定向或新建标签页
        } else {
          next();
        }
      } else {
        next("/");
        ElMessage({
          message: '请先登录！',
          type: 'warning',
          customClass: 'large-message',
          duration: 5000
        });
      }
    }
    document.title = to.meta.title;
  });

export default router;
