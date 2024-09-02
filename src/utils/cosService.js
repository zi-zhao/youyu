import COS from 'cos-js-sdk-v5';
import axios from './request'; 
import { ElMessage } from 'element-plus';
import { ref} from 'vue';

const cosPermission = ref();
const cosBucket = ref([
    {id:1,address:'youyu-bucket-1-1319554411'},
    {id:2,address:'youyu-bucket-article-invisible-1319554411'},
    {id:3,address:'youyu-bucket-attachment-1319554411'},
    {id:4,address:'youyu-bucket-user-invisible-1319554411'},
    {id:5,address:'youyu-bucket-websocket-invisible-1319554411'},
    {id:6,address:'youyu-bucket-article-visible-1319554411'},
    {id:7,address:'youyu-bucket-share-invisible-1319554411'},
]);

// 上传文件到COS的函数(分块上传)
async function uploadFileToCOS(file, SliceSize,type,id,bucketId) {
    if (!cosPermission.value) {
        console.error('获取COS权限失败');
        return;
    }
    const bucketInfo = cosBucket.value.find(bucket => bucket.id === bucketId);
    if (!bucketInfo) {
        console.error('无效的存储桶ID');
        return;
    }
    // 获取COS权限和实例化
    const cos = new COS({
        SecretId: cosPermission.value.tmpSecretId,
        SecretKey: cosPermission.value.tmpSecretKey,
    });
    // 执行上传
    cos.uploadFile({
        Bucket: bucketInfo.address, 
        Region: 'ap-chengdu', 
        Key: cosPermission.value.url,
        Body: file,
        SliceSize: SliceSize, // 分片大小
        onTaskReady: (taskId) => {
            console.log(taskId);
        },
        onProgress: (progressData) => {
            console.log(JSON.stringify(progressData));
        },
        onFileFinish: (err, data, options) => {
           console.log(options.Key + '上传' + (err ? '失败' : '完成'));
           if(err === null && type != -1 ){
            noticeSelected(type,id);
           }else{
            console.log(err);
            ElMessage.error('数据上传失败');
            noticeSelectedError(type,id);
           }
        },
    }, (err, data) => {
        console.log(err || data);
    });
}


// 上传文件到COS的函数(普通上传)
async function uploadSmallFileToCOS(file, type, id,bucketId) {
    if (!cosPermission.value) {
        console.error('获取COS权限失败');
        return;
    }
    const bucketInfo = cosBucket.value.find(bucket => bucket.id === bucketId);
    if (!bucketInfo) {
        console.error('无效的存储桶ID');
        return;
    }
    const cos = new COS({
        SecretId: cosPermission.value.tmpSecretId,
        SecretKey: cosPermission.value.tmpSecretKey,
    });
    console.log("COS Key:", cosPermission.value.url);
    cos.putObject({
        Bucket: bucketInfo.address,
        Region: 'ap-chengdu',
        Key: cosPermission.value.url,
        Body: file,
        onProgress: (progressData) => {
            console.log(JSON.stringify(progressData));
        }
    }, (err, data) => {
        if (err) {
            console.error('上传失败', err);
            ElMessage.error('数据上传失败');
            noticeSelectedError(type, id);
        } else {
            console.log('上传成功', data);
            noticeSelected(type, id);
        }
    });
}

// 上传文件到COS的函数(多文件上传，因为前端需要自己拼url)
async function uploadMultipleFilesToCOS(files, filenames, type, id, bucketId) {
    if (!cosPermission.value) {
        console.error('获取COS权限失败');
        return;
    }
    const bucketInfo = cosBucket.value.find(bucket => bucket.id === bucketId);
    if (!bucketInfo) {
        console.error('无效的存储桶ID');
        return;
    }
    const cos = new COS({
        SecretId: cosPermission.value.tmpSecretId,
        SecretKey: cosPermission.value.tmpSecretKey,
    });
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = filenames[i];
        const fileNameWithPath = `${cosPermission.value.url}/${filename}`; // 在文件名前加时间戳和路径
        console.log("COS Key:", fileNameWithPath);
        await new Promise((resolve, reject) => {
            cos.putObject({
                Bucket: bucketInfo.address,
                Region: 'ap-chengdu',
                Key: fileNameWithPath,
                Body: file,
                onProgress: (progressData) => {
                    console.log(JSON.stringify(progressData));
                }
            }, (err, data) => {
                if (err) {
                    console.error('上传失败', err);
                    ElMessage.error('数据上传失败');
                    reject(err);
                } else {
                    console.log('上传成功', data);
                    resolve(data);
                }
            });
        }).catch(err => {
            // 处理上传过程中发生的错误
            noticeSelectedError(type, id);
            console.log(err);
            return; // 遇到错误时终止循环
        });
    }
    // 所有文件上传完成后的逻辑
    noticeSelected(type, id);
}


//因为websocket需要给后端返回一些数据，所以单独写了一个函数
async function uploadSmallFileToWEBSOCKETCOS(file, type, bucketId) {
    return new Promise((resolve, reject) => {
        if (!cosPermission.value){
            console.error('获取COS权限失败');
            reject('获取COS权限失败');
        }
        const bucketInfo = cosBucket.value.find(bucket => bucket.id === bucketId);
        if (!bucketInfo) {
            console.error('无效的存储桶ID');
            reject('无效的存储桶ID');
        }
        const cos = new COS({
            SecretId: cosPermission.value.tmpSecretId,
            SecretKey: cosPermission.value.tmpSecretKey,
        });

        console.log("COS Key:", cosPermission.value.url);
        cos.putObject({
            Bucket: bucketInfo.address,
            Region: 'ap-chengdu',
            Key: cosPermission.value.url,
            Body: file,
            onProgress: (progressData) => {
                console.log(JSON.stringify(progressData));
            }
        }, (err, data) => {
            if (err) {
                console.error('上传失败', err);
                ElMessage.error('数据上传失败');
                if(type === 3){
                    reject(0);
                }
                if(type === 11){
                    reject(0);           
                }
            } else {
                console.log('上传成功', data);
                if(type === 3){
                    resolve(1);
                }
                if(type === 11){
                    const tempUrl = 'https://';
                    const fileUrl = data.Location;  // 文件的真实地址
                    const combinedUrl = tempUrl + fileUrl;
                    console.log(combinedUrl);
                    resolve(combinedUrl);
                }
            }
        });
    });
}


// 从COS下载文件到本地的函数(单个文件)
async function downloadFileFromCOS(bucketId) {
    if (!cosPermission.value) {
        console.error('获取COS权限失败');
        return;
    }
    const bucketInfo = cosBucket.value.find(bucket => bucket.id === bucketId);
    if (!bucketInfo) {
        console.error('无效的存储桶ID');
        return;
    }
    // 获取COS权限和实例化
    const cos = new COS({
        SecretId: cosPermission.value.tmpSecretId,
        SecretKey: cosPermission.value.tmpSecretKey,
    });
    // 执行下载
    cos.getObjectUrl({
        Bucket: bucketInfo.address,
        Region: 'ap-chengdu',
        Key: cosPermission.value.url,
        onProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
        }  
        },function(err, data) {
            if (err === null) {
                console.log(data);
                const url = data.Url;
                console.log('下载成功');
                return url;
            }else{
                console.log(err);
                ElMessage.error('数据获取失败');
            }
    });
}


// 从COS下载文件到本地的函数(多个文件)
async function downloadFilesFromCOS(bucketId) {
    if (!cosPermission.value) {
        console.error('获取COS权限失败');
        return;
    }
    const bucketInfo = cosBucket.value.find(bucket => bucket.id === bucketId);
    if (!bucketInfo) {
        console.error('无效的存储桶ID');
        return;
    }
    const cos = new COS({
        SecretId: cosPermission.value.tmpSecretId,
        SecretKey: cosPermission.value.tmpSecretKey,
    });
    let fileUrls = {}; // 用于存储文件的 URL
    try {
        // 获取文件夹内的所有文件
        const response =  cos.getBucket({
            Bucket: bucketInfo.address,
            Region: 'ap-chengdu',
            Prefix: cosPermission.value.url, // 指定文件夹路径
        });
        // 遍历所有文件并获取其 URL
        for (const file of response.Contents) {
            const url = await new Promise((resolve, reject) => {
                cos.getObjectUrl({
                    Bucket: bucketInfo,
                    Region: 'ap-chengdu',
                    Key: file.Key,
                }, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.Url);
                    }
                });
            });
            fileUrls[file.Key] = url; // 将 URL 添加到对象中
        }
        return fileUrls; // 返回包含所有文件 URL 的对象
    } catch (err) {
        console.error(err);
        ElMessage.error('数据获取失败');
        return null;
    }
}

// 获取文章附件上传的COS许可证的函数
export async function getArticleCOSPermission(file, SliceSize, articleId, fileName,fileSize, requiredCoin, requiredPoint) {
    try {
        const response = await axios.post(`/article/attachment/upload/secret`, {
            articleId:articleId,
            size: fileSize,
            requiredCoin:requiredCoin,
            requiredPoint:requiredPoint,
            filename: fileName,
        });
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            await uploadFileToCOS(file,SliceSize,1,articleId,3);
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//上传完毕通知后端(文章附件上传)
async function noticeArticleAttachment(articleId) {
    const response = await axios.put(`/article/attachment/${articleId}`);
    if(response.data.code === 1){
        // ElMessage.success('通知成功');
    }else{
        ElMessage.error('通知失败');
    }
}


// 获取认证材料上传的COS许可证的函数
export async function getCertificateCOSPermission(file,filename) {
    try {
        const queryParams = new URLSearchParams({
            filename: filename,
          }).toString();  
        const response = await axios.post(`/file/upload/certificate/secret?${queryParams}`)
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            await uploadSmallFileToCOS(file,10,0,4);
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//上传完毕通知后端(认证材料上传)
async function noticeCertificateCOS() {
    const response = await axios.put(`/file/certificate`);
    if(response.data.code === 1){
        // ElMessage.success('通知成功');
    }else{
        ElMessage.error('通知失败');
    }
}


// 获取认证材料的函数
export async function getCertificateFromCOS(type) {
    try {
        const response = await axios.get(`/file/download/certificate/secret`, {
            params: {
                type:type,
            }
        });
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            const urls = await downloadFilesFromCOS();
            return urls;
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}


// 获取首次提问图片上传的COS许可证的函数
export async function getFistQuestionCOSPermission(file,filename,questionId) {
    try {
        const queryParams = new URLSearchParams({
            questionId: questionId,
            filename:filename,
          }).toString();  
        const response = await axios.post(`/file/upload/question/picture/secret?${queryParams}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            await uploadSmallFileToCOS(file,2,questionId,5);
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//上传完毕通知后端(第一次提问图片上传)
async function noticeFistQuestionCOS(questionId) {
    const response = await axios.put(`/file/question/picture/${questionId}`);
    if(response.data.code === 1){
        // ElMessage.success('通知成功');
    }else{
        ElMessage.error('通知失败');
    }
}

// 获取首次提问图片的函数
export async function getFirstQuestionPictureFromCOS(questionId) {
    try {
        const response = await axios.get(`/file/download/question/picture/secret/${questionId}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            // const urls = await downloadFilesFromCOS();
            // return urls;
            return cosPermission.value.url;
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}


// 获取首次回答图片上传的COS许可证的函数
export async function getFistAnswerCOSPermission(file,filename,questionId) {
    try {
        const queryParams = new URLSearchParams({
            filename: filename,
            questionId: questionId,
          }).toString();  
        const response = await axios.post(`/file/answer/upload/secret?${queryParams}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            await uploadSmallFileToCOS(file,8,questionId,5);
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//上传完毕通知后端(第一次回答图片上传)
async function noticeFistAnswerCOS(questionId) {
    const response = await axios.put(`/file/answer/${questionId}`);
    if(response.data.code === 1){
        // ElMessage.success('通知成功');
    }else{
        ElMessage.error('通知失败');
    }
}

// 获取首次回答图片的函数
export async function getFirstAnswerPictureFromCOS(questionId) {
    try {
        const response = await axios.get(`/file/answer/download/secret/${questionId}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            // const url = await downloadFileFromCOS();
            // return url;
            return cosPermission.value.url;
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

// 获取聊天时上传图片的COS许可证的函数
export async function getAskAndQuestionCOSPermission(file,dto) {
    cosPermission.value.tmpSecretId = dto.tmpSecretId;
    cosPermission.value.tmpSecretKey = dto.tmpSecretKey;
    // cosPermission.value.url = 'text.jpg';
    // console.log(dto);
    cosPermission.value.url =dto.url;
    const num = await uploadSmallFileToWEBSOCKETCOS(file,3,5);
    return num;
}

//上传完毕通知后端(问答聊天图片正确上传)
async function noticeAskAndQuestion() {
    return 1;
  }

//上传完毕通知后端(问答聊天图片错误上传)
async function noticeAskAndQuestionError() {
    return 0;
}


// 获取收藏主图上传的COS许可证的函数
export async function getFavoritePermission(file, filename,favoriteId) {
    try {
        const queryParams = new URLSearchParams({
            filename:filename,
            favoriteId: favoriteId,
          }).toString();  
        const response = await axios.post(`/file/favorite/upload/secret?${queryParams}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            await uploadSmallFileToCOS(file,4,favoriteId,4);
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//上传完毕通知后端(收藏主图上传)
async function noticefavoritePicture(favoriteId) {
    const response = await axios.put(`/file/favorite/${favoriteId}`);
    if(response.data.code === 1){
        // ElMessage.success('通知成功');
    }else{
        ElMessage.error('通知失败');
    }
}

// 获取收藏主图图片的函数
export async function getFavoritePictureFromCOS(favoriteId) {
    try {
        const response = await axios.get(`/file/favorite/download/secret/${favoriteId}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            // const url = await downloadFileFromCOS();
            // return url;
            return cosPermission.value.url;
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

// 获取专栏主图上传的COS许可证的函数
export async function getColumnPermission(file, filename,columnId) {
    try {
        const queryParams = new URLSearchParams({
            filename:filename,
            columnId: columnId,
          }).toString();  
        const response = await axios.post(`/file/column/upload/secret?${queryParams}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            await uploadSmallFileToCOS(file,9,columnId,4);
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//上传完毕通知后端(专栏主图上传)
async function noticeColumnPicture(columnId) {
    const response = await axios.put(`/file/column/${columnId}`);
    if(response.data.code === 1){
        // ElMessage.success('通知成功');
    }else{
        ElMessage.error('通知失败');
    }
}

// 获取专栏主图图片的函数
export async function getColumnPictureFromCOS(columnId) {
    try {
        const response = await axios.get(`/file/column/download/secret/${columnId}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            // const url = await downloadFileFromCOS();
            // return url;
            return cosPermission.value.url;
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

// 获取用户头像上传的COS许可证的函数
export async function getUsersAvatarPermission(file, filename) {
    try {
        const queryParams = new URLSearchParams({
            filename:filename,
          }).toString();  
        const response = await axios.post(`/file/users/avatar/upload/secret?${queryParams}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            await uploadSmallFileToCOS(file,5,0,4);
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//上传完毕通知后端(用户头像上传)
async function noticeUsersAvatar() {
    const response = await axios.put(`/file/users/avatar`);
    if(response.data.code === 1){
        // ElMessage.success('通知成功');
    }else{
        ElMessage.error('通知失败');
    }
}

// 获取用户头像图片的函数
export async function getUsersAvatarFromCOS(id) {
    try {
        const response = await axios.get(`/file/users/avatar/download/secret/${id}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            // const url = await downloadFileFromCOS(4);
            // return url;
            return cosPermission.value.url;
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

// 获取文章内容图片上传的COS许可证的函数
export async function getArticleContentPermission(file, articleId,filename) {
    try {
        const queryParams = new URLSearchParams({
            filename:filename,
            articleId:articleId,
          }).toString();  
        const response = await axios.post(`/file/article/picture/upload/secret?${queryParams}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            const url = await uploadSmallFileToWEBSOCKETCOS(file,11,6);
            if(url != 0){
                return url;
            }else{
                ElMessage.error('文章内容图片上传失败');
            }
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

// 获取文章主图上传的COS许可证的函数
export async function getArticleCoveragePermission(file, filename,articleId) {
    try {
        const queryParams = new URLSearchParams({
            filename:filename,
            articleId:articleId,
          }).toString();  
        const response = await axios.post(`/file/article/coverage/upload/secret?${queryParams}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            await uploadSmallFileToCOS(file,6,articleId,2);
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//上传完毕通知后端(文章主图上传)
async function noticeArticleCoverage(articleId) {
    const response = await axios.put(`/file/article/coverage/${articleId}`);
    if(response.data.code === 1){
        // ElMessage.success('通知成功');
    }else{
        ElMessage.error('通知失败');
    }
}

// 获取文章主图图片的函数
export async function getArticleCoverageFromCOS(articleId) {
    try {
        const response = await axios.get(`/file/article/coverage/download/secret/${articleId}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            // const url = await downloadFileFromCOS();
            // return url;
            return cosPermission.value.url;
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}


// 获取分享图片上传的COS许可证的函数
export async function getSharePicturePermission(files,filename,number,shareId) {
    try {
        const queryParams = new URLSearchParams({
            number:number,
            shareId:shareId,
          }).toString();  
        const response = await axios.post(`/file/share/picture/upload/secret?${queryParams}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            await uploadMultipleFilesToCOS(files,filename,7,shareId,7);
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//上传完毕通知后端(分享图片上传)
async function noticeSharePicture(shareId) {
    const response = await axios.put(`/file/share/picture/${shareId}`);
    if(response.data.code === 1){
        // ElMessage.success('通知成功');
    }else{
        ElMessage.error('通知失败');
    }
}

// 获取分享图片的函数
export async function getSharePictureFromCOS(shareId) {
    try {
        const response = await axios.get(`/file/share/picture/secret/${shareId}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            const urls = await downloadFilesFromCOS();
            return urls;
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

// 获取视频切片的函数
export async function getVideoPaperFromCOS(id) {
    try {
        const response = await axios.get(`/file/paper/video/download/secret/${id}`);
        if (response.data.code === 1) {
            cosPermission.value = response.data.data;
            // const url = await downloadFileFromCOS();
            // return url;
            return cosPermission.value.url;
        } else {
            console.error(response.data.msg || '未知错误');
            return null;
        }
    } catch (error) {
        console.error('获取COS权限失败', error.message);
        return null;
    }
}

//这是一个神奇的方法
export async function HAHAHAHA(){
    downloadFileFromCOS()
}

//根据不同的type选择对应的通知接口
async function noticeSelected(type, id) {
    switch (type) {
        case 1:
            await noticeArticleAttachment(id);
            break;
        case 2:
            await noticeFistQuestionCOS(id);
            break;
        case 3:
            await noticeAskAndQuestion();
            break;    
        case 4:
            await noticefavoritePicture(id);
            break;    
        case 5:
            await noticeUsersAvatar();
            break;    
        case 6:
            await noticeArticleCoverage(id);
            break;    
        case 7:
            await noticeSharePicture(id);
            break;    
        case 8:
            await noticeFistAnswerCOS(id);
            break;    
        case 9:
            await noticeColumnPicture(id);
            break;    
        case 10:
            await noticeCertificateCOS();
            break;    
        case 12:
            break;   
            
        default:
            // 处理未知的 type
            console.log('未知的类型:', type);
            break;
    }
}

//根据不同的type选择对应的通知接口
async function noticeSelectedError(type, id) {
    switch (type) {
        case 3:
            await noticeAskAndQuestionError();
            break;

        default:
            // 处理未知的 type
            console.log('未知的类型:', id);
            break;
    }
}