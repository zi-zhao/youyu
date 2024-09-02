import router from '@/router/index.js'; // 替换为你的路由配置文件的实际路径

export function openUrl(path, openInNewTab = true) {
  const routeLocation = router.resolve({ path }); // 解析路径

  if (isMobileDevice() || !openInNewTab) {
    router.push(path);
  } else {
    window.open(routeLocation.href, '_blank'); // 使用解析后的完整 URL
  }
}

function isMobileDevice() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}
