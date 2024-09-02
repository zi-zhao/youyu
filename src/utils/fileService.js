import axios from "./request";
import JSZip from 'jszip';
import { onMounted, watch, ref } from "vue";
import { useRouter } from "vue-router";

// const CHUNK_SIZE = 1 * 1024 * 1024;

// 创建一个通用的文件获取函数
async function fetchFile(filePath) {
  try {
    const response = await axios.get(filePath, {
      responseType: "blob",
    });

    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.onerror = function (event) {
        reject(event.target.error);
      };
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

// 压缩图片函数
export const compressImage = (
  file,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.7
) => {
  return new Promise((resolve, reject) => {
    if (file.size <= 8 * 1024 * 1024) {
      // 如果文件大小小于或等于8MB，则不压缩，直接返回原文件
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 计算缩放比例
        const scaleWidth = maxWidth / width;
        const scaleHeight = maxHeight / height;
        const scale = Math.min(scaleWidth, scaleHeight);
        width = scale < 1 ? width * scale : width;
        height = scale < 1 ? height * scale : height;

        // 创建canvas并绘制压缩后的图像
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // 输出为blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 创建压缩后的图像文件对象
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

 //解压缩图片，用于分享图片的获取
 const fetchAndExtractImages = async (filePath) => {
  try {
      const response = await axios.get(filePath, {
          responseType: 'arraybuffer'
      });
      const zip = new JSZip();
      const data = await zip.loadAsync(response.data);
      const extractedImages = [];
      for (let filename in data.files) {
          const file = data.files[filename];
          if (!file.dir && /\.(png|jpg|jpeg|gif)$/.test(filename)) {
              const blobData = await file.async('blob');
              const imageUrl = URL.createObjectURL(blobData);
              extractedImages.push(imageUrl);
          }
      }
      return extractedImages;
  } catch (error) {
      console.error("Error while fetching or processing zip:", error);
      return [];
  }
};


//读取用户头像
export async function fetchUserAvatar(id) {
  const filePath = `/file/users/avatar/${id}`;
  return fetchFile(filePath);
}
//读取主页文章封面
export async function fetchArticleCoverage(articleId) {
  const filePath = `/file/article/coverage/${articleId}`;
  return fetchFile(filePath);
}
//读取分享组图
export async function fetchShareCoverage(shareId) {
  const filePath = `/file/share/picture/${shareId}`;
  return fetchAndExtractImages(filePath);
}
//读取新闻封面
export async function fetchNewsCoverage(id) {
  const filePath = `/file/news/coverage/${id}`;
  return fetchFile(filePath);
}
//读取专栏封面
export async function fetchColumnCoverage(columnId) {
  const filePath = `/file/column/${columnId}`;
  return fetchFile(filePath);
}
//读取收藏封面
export async function fetchFavoriteCoverage(favoriteId) {
  const filePath = `/file/favorite/${favoriteId}`;
  return fetchFile(filePath);
}
//读取提问图片
export async function fetchQuestionPicture(questionId) {
  const filePath = `/file/question/${questionId}`;
  return fetchAndExtractImages(filePath);
}
//读取回答图片
export async function fetchAnswerPicture(questionId) {
  const filePath = `/file/answer/${questionId}`;
  return fetchFile(filePath);
}
//设置标题
export function PageTitle(initialTitle) {
  const pageTitle = ref(initialTitle);

  onMounted(() => {
    document.title = pageTitle.value;
  });

  watch(pageTitle, (newTitle) => {
    document.title = newTitle;
  });

  // 提供一个函数来更新页面标题
  function setPageTitle(newTitle) {
    pageTitle.value = newTitle;
  }

  return setPageTitle;
}

//判断设备是否为手机端，若是，将windows.open方法改为router.push
export const useNavigation = () => {
  const router = useRouter();

  const navigate = (path) => {
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      router.push(path);
    } else {
      const routeLocation = router.resolve({ path });
      window.open(routeLocation.href, "_blank");
    }
  };

  return navigate;
};